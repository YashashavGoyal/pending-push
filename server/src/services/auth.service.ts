import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { RegisterInput, LoginInput, AdminLoginInput, UpdateUserInput } from '../validators/auth.validator.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/app-error.js';
import { config } from '../config/env.js';
import { UserPublicProfile, AuthPayload } from '../types/index.js';

export interface AuthResponse {
  token: string;
  userId: string;
  user: UserPublicProfile;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async register(data: RegisterInput): Promise<AuthResponse> {
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

    const token = this.generateToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token,
      userId: user.id,
      user: publicProfile,
    };
  }

  public async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const token = this.generateToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token,
      userId: user.id,
      user: publicProfile,
    };
  }

  public async adminLogin(data: AdminLoginInput): Promise<AuthResponse> {
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

    const token = this.generateToken({ userId: user.id, role: user.role });
    const { passwordHash: _, ...publicProfile } = user;

    return {
      token,
      userId: user.id,
      user: publicProfile,
    };
  }

  public async getUserProfile(userId: string): Promise<UserPublicProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash: _, ...publicProfile } = user;
    return publicProfile;
  }

  private generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}
