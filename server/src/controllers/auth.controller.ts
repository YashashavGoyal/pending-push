import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as RegisterInput;
    const result = await this.authService.register(body);
    reply.status(201).send({
      success: true,
      message: 'Account Created Successfully',
      token: result.token,
      userId: result.userId,
      user: result.user,
    });
  };

  public login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as LoginInput;
    const result = await this.authService.login(body);
    reply.status(200).send({
      success: true,
      message: 'Login Successfull',
      token: result.token,
      userId: result.userId,
      user: result.user,
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
}
