import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { AdminService } from '../services/admin.service.js';
import { AdminLoginInput } from '../validators/auth.validator.js';
import { parseClientDeviceInfo } from '../utils/device-parser.js';

export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  public login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as AdminLoginInput;
    const clientInfo = parseClientDeviceInfo(request);
    const result = await this.authService.adminLogin(body, clientInfo);

    reply.setCookie('refreshToken', result.refreshToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60,
    });

    reply.status(200).send({
      success: true,
      message: 'Logged In',
      token: result.accessToken,
      accessToken: result.accessToken,
      userId: result.userId,
      user: result.user,
    });
  };

  public getUsers = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '50', 10);
    const result = await this.adminService.getAllUsers(limit, query.cursor);
    reply.status(200).send({
      success: true,
      message: 'Successfully Fetched Users',
      users: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public deleteUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { id: string };
    await this.adminService.deleteUser(params.id);
    reply.status(200).send({
      success: true,
      message: 'User Deleted',
    });
  };

  public getUserPosts = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { id: string };
    const result = await this.adminService.getUserPosts(params.id);
    reply.status(200).send({
      success: true,
      message: 'Post Fetched Succesfully',
      posts: result.items,
    });
  };

  public getPosts = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.adminService.getAllPosts();
    reply.status(200).send({
      success: true,
      message: 'Successfully Fetched Posts',
      posts: result.items,
      hasMore: result.hasMore,
    });
  };

  public getContacts = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.adminService.getAllContacts();
    reply.status(200).send({
      success: true,
      message: 'Successfully Fetched Contacts',
      contacts: result.items,
      messageList: result.items,
    });
  };

  public deleteContact = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { id: string };
    await this.adminService.deleteContact(params.id);
    reply.status(200).send({
      success: true,
      message: 'Message Deleted',
    });
  };

  public cleanupSessions = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const deletedCount = await this.authService.purgeExpiredSessions();
    reply.status(200).send({
      success: true,
      message: `Pruned ${deletedCount} expired or revoked sessions`,
      deletedCount,
    });
  };
}
