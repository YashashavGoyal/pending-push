import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { IPostRepository } from '../repositories/interfaces/post.repository.interface.js';
import { IContactRepository } from '../repositories/interfaces/contact.repository.interface.js';
import { NotFoundError } from '../errors/app-error.js';
import { User, Post, ContactMessage, PaginatedResult } from '../types/index.js';

export class AdminService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly postRepository: IPostRepository,
    private readonly contactRepository: IContactRepository
  ) {}

  public async getAllUsers(limit = 50, cursor?: string): Promise<PaginatedResult<User>> {
    return this.userRepository.findAll({ limit, cursor });
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await this.userRepository.deleteById(id);
  }

  public async getUserPosts(userId: string): Promise<PaginatedResult<Post>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.postRepository.findByAuthorId(userId);
  }

  public async getAllPosts(limit = 50, cursor?: string) {
    return this.postRepository.findFeed({ limit, cursor });
  }

  public async getAllContacts(limit = 50, cursor?: string): Promise<PaginatedResult<ContactMessage>> {
    return this.contactRepository.findAll({ limit, cursor });
  }

  public async deleteContact(id: string): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact message not found');
    }
    await this.contactRepository.deleteById(id);
  }
}
