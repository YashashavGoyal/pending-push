import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { parseClientDeviceInfo } from '../utils/device-parser.js';
import { config } from '../config/env.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as RegisterInput;
    const clientInfo = parseClientDeviceInfo(request);

    const result = await this.authService.register(body, clientInfo);
    this.setRefreshCookie(reply, result.refreshToken);

    reply.status(201).send({
      success: true,
      message: 'Account Created Successfully',
      token: result.accessToken, // backward compatibility
      accessToken: result.accessToken,
      userId: result.userId,
      user: result.user,
    });
  };

  public login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as LoginInput;
    const clientInfo = parseClientDeviceInfo(request);

    const result = await this.authService.login(body, clientInfo);
    this.setRefreshCookie(reply, result.refreshToken);

    reply.status(200).send({
      success: true,
      message: 'Login Successfull',
      token: result.accessToken, // backward compatibility
      accessToken: result.accessToken,
      userId: result.userId,
      user: result.user,
    });
  };

  public refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const rawRefreshToken = this.getRefreshToken(request);
    const clientInfo = parseClientDeviceInfo(request);

    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token missing from cookie or request body');
    }

    const result = await this.authService.refresh(rawRefreshToken, clientInfo);
    this.setRefreshCookie(reply, result.refreshToken);

    reply.status(200).send({
      success: true,
      message: 'Token refreshed successfully',
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user,
    });
  };

  public logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const rawRefreshToken = this.getRefreshToken(request);
    await this.authService.logout(rawRefreshToken);
    this.clearRefreshCookie(reply);

    reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  };

  public getMe = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const user = await this.authService.getUserProfile(userId);
    reply.status(200).send({
      success: true,
      message: 'User Data Fetched Succesfully',
      user,
    });
  };

  public getSessions = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const currentRefreshToken = this.getRefreshToken(request);
    const sessions = await this.authService.listSessions(userId, currentRefreshToken);

    reply.status(200).send({
      success: true,
      message: 'Active sessions fetched successfully',
      sessions,
    });
  };

  public revokeSession = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const params = request.params as { id: string };
    await this.authService.revokeSession(userId, params.id);

    reply.status(200).send({
      success: true,
      message: 'Session revoked successfully',
    });
  };

  public revokeOtherSessions = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const currentRefreshToken = this.getRefreshToken(request);
    if (!currentRefreshToken) {
      throw new UnauthorizedError('Current session refresh token missing');
    }

    const count = await this.authService.revokeOtherSessions(userId, currentRefreshToken);

    reply.status(200).send({
      success: true,
      message: `Revoked ${count} other active session(s)`,
    });
  };

  private setRefreshCookie(reply: FastifyReply, refreshToken: string): void {
    reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });
  }

  private clearRefreshCookie(reply: FastifyReply): void {
    reply.clearCookie('refreshToken', { path: '/' });
  }

  private getRefreshToken(request: FastifyRequest): string | undefined {
    const rawCookie = request.cookies?.refreshToken;
    if (rawCookie) {
      if (typeof request.unsignCookie === 'function') {
        const unsigned = request.unsignCookie(rawCookie);
        if (unsigned.valid && unsigned.value) {
          return unsigned.value;
        }
      }
      return rawCookie;
    }
    const body = request.body as Record<string, unknown> | undefined;
    return body?.refreshToken as string | undefined;
  }
}
