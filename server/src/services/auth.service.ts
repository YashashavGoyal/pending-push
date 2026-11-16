import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { ISessionRepository } from '../repositories/interfaces/session.repository.interface.js';
import { RegisterInput, LoginInput, AdminLoginInput } from '../validators/auth.validator.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/app-error.js';
import { config } from '../config/env.js';
import { UserPublicProfile, AuthPayload, ClientDeviceInfo, SessionPublicInfo } from '../types/index.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  token: string; // Access Token (for backward compatibility)
  accessToken: string;
  refreshToken: string;
  userId: string;
  user: UserPublicProfile;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPublicProfile;
}

export class AuthService {
  private readonly REFRESH_TOKEN_DAYS = 30;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  public async register(data: RegisterInput, clientInfo: ClientDeviceInfo): Promise<AuthResponse> {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new BadRequestError('User already exists with this email');
    }

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new BadRequestError('Username is already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      role: 'user',
    });

    const { accessToken, refreshToken } = await this.createSession(user.id, user.role, clientInfo);
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      userId: user.id,
      user: publicProfile,
    };
  }

  public async login(data: LoginInput, clientInfo: ClientDeviceInfo): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.createSession(user.id, user.role, clientInfo);
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      userId: user.id,
      user: publicProfile,
    };
  }

  public async adminLogin(data: AdminLoginInput, clientInfo: ClientDeviceInfo): Promise<AuthResponse> {
    let user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      user = await this.userRepository.findByEmail(data.username);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedError('You are not authorized as an Administrator');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.createSession(user.id, user.role, clientInfo);
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      userId: user.id,
      user: publicProfile,
    };
  }

  /**
   * Refresh Token Rotation (RTR):
   * Validates refresh token, detects token reuse/theft, and issues new access + refresh tokens.
   */
  public async refresh(rawRefreshToken: string, clientInfo: ClientDeviceInfo): Promise<RefreshResponse> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Token reuse detection (anti-theft)
    if (session.isRevoked) {
      // Possible compromise: revoke all sessions for this user!
      await this.sessionRepository.revokeAllForUser(session.userId);
      throw new UnauthorizedError('Session revoked due to token reuse detection. Please log in again.');
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.revokeById(session.id);
      throw new UnauthorizedError('Session expired. Please log in again.');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken({ userId: user.id, role: user.role });

    // Rotate refresh token
    const newRawRefreshToken = this.generateRandomToken();
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const newExpiresAt = this.calculateExpiry(this.REFRESH_TOKEN_DAYS);

    await this.sessionRepository.rotateToken(
      session.id,
      newTokenHash,
      newExpiresAt,
      clientInfo.ipAddress
    );

    const { passwordHash: _, ...publicProfile } = user;

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: publicProfile,
    };
  }

  public async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      const session = await this.sessionRepository.findByTokenHash(tokenHash);
      if (session) {
        await this.sessionRepository.revokeById(session.id);
      }
    }
  }

  public async listSessions(userId: string, currentRefreshToken?: string): Promise<SessionPublicInfo[]> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    const currentHash = currentRefreshToken ? this.hashToken(currentRefreshToken) : null;

    return sessions.map((s) => ({
      id: s.id,
      deviceName: s.deviceName,
      ipAddress: s.ipAddress,
      metadata: s.metadata,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isCurrent: currentHash ? s.tokenHash === currentHash : false,
    }));
  }

  public async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundError('Session not found');
    }
    await this.sessionRepository.revokeById(sessionId);
  }

  public async revokeOtherSessions(userId: string, currentRefreshToken: string): Promise<number> {
    if (!currentRefreshToken) {
      throw new BadRequestError('Current refresh token is required');
    }
    const tokenHash = this.hashToken(currentRefreshToken);
    const currentSession = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!currentSession || currentSession.userId !== userId) {
      throw new UnauthorizedError('Current session could not be verified');
    }

    return this.sessionRepository.revokeAllForUser(userId, currentSession.id);
  }

  public async getUserProfile(userId: string): Promise<UserPublicProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash: _, ...publicProfile } = user;
    return publicProfile;
  }

  private async createSession(
    userId: string,
    role: 'user' | 'admin',
    clientInfo: ClientDeviceInfo
  ): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken({ userId, role });
    const rawRefreshToken = this.generateRandomToken();
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = this.calculateExpiry(this.REFRESH_TOKEN_DAYS);

    await this.sessionRepository.create({
      userId,
      tokenHash,
      deviceName: clientInfo.deviceName,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: clientInfo.metadata,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  private generateAccessToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: (config.jwtExpiresIn || '15m') as jwt.SignOptions['expiresIn'],
    });
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiry(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
