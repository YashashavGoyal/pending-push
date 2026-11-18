import { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from '../services/analytics.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { UpdateUserRoleInput } from '../validators/analytics.validator.js';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  public getUserActivity = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { username: string };
    const requesterUserId = request.userId;

    const activity = await this.analyticsService.getUserActivityHeatmap(
      params.username,
      requesterUserId
    );

    reply.status(200).send({
      success: true,
      activity,
    });
  };

  public getAuthorTelemetry = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const telemetry = await this.analyticsService.getAuthorTelemetry(userId);

    reply.status(200).send({
      success: true,
      telemetry,
    });
  };

  public getPlatformStats = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const stats = await this.analyticsService.getPlatformStats();

    reply.status(200).send({
      success: true,
      stats,
    });
  };

  public getAdminUsers = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '20', 10);

    const result = await this.analyticsService.getAdminUsers({
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      users: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public updateUserRole = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const adminId = request.userId;
    if (!adminId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const body = request.body as UpdateUserRoleInput;

    const updatedUser = await this.analyticsService.updateUserRole(params.id, body.role, adminId);

    reply.status(200).send({
      success: true,
      message: `User role updated to ${body.role}`,
      user: updatedUser,
    });
  };
}
