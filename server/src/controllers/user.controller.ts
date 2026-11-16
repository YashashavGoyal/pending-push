import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { UpdateUserConfigInput, UpdateUserProfileInput } from '../validators/user.validator.js';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { username: string };
    const viewerUserId = request.userId;

    const profile = await this.userService.getProfileByUsername(params.username, viewerUserId);
    reply.status(200).send({
      success: true,
      profile,
    });
  };

  public getPreferences = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const preferences = await this.userService.getUserPreferences(userId);
    reply.status(200).send({
      success: true,
      preferences,
    });
  };

  public updatePreferences = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = request.body as UpdateUserConfigInput;
    const preferences = await this.userService.updateUserPreferences(userId, body);

    reply.status(200).send({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  };

  public updateProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = request.body as UpdateUserProfileInput;
    const profile = await this.userService.updateUserProfile(userId, body);

    reply.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  };
}
