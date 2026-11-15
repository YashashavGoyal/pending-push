import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { AdminService } from '../services/admin.service.js';
import { AdminLoginInput } from '../validators/auth.validator.js';

export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService
  ) {}

  public login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as AdminLoginInput;
    const result = await this.authService.adminLogin(body);
    reply.status(200).send({
      success: true,
      message: 'Logged In',
      token: result.token,
      userId: result.userId,
      user: result.user,
    });
  };

  public getUsers = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = await this.adminService.getAllUsers();
    reply.status(200).send({
      success: true,
      message: 'Successfully Fetched Users',
      users: result.items,
      hasMore: result.hasMore,
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
}
