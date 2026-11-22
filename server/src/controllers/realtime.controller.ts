import { FastifyRequest, FastifyReply } from 'fastify';
import { RealtimeService } from '../services/realtime.service.js';
import { UnauthorizedError } from '../errors/app-error.js';

export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  public getConfig = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const config = this.realtimeService.getPublicConfig();
    reply.status(200).send({
      success: true,
      data: config,
    });
  };

  public getHealth = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const health = await this.realtimeService.checkHealth();
    reply.status(200).send({
      success: true,
      data: health,
    });
  };

  public getToken = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const tokenResponse = await this.realtimeService.getClientToken(userId, {
      role: request.user?.role,
    });

    reply.status(200).send({
      success: true,
      message: 'Realtime client token generated successfully',
      data: tokenResponse,
    });
  };
}
