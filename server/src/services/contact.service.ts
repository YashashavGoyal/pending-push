import { IContactRepository } from '../repositories/interfaces/contact.repository.interface.js';
import { ContactInput } from '../validators/contact.validator.js';
import { NotFoundError } from '../errors/app-error.js';
import { ContactMessage, PaginatedResult } from '../types/index.js';

export class ContactService {
  constructor(private readonly contactRepository: IContactRepository) {}

  public async sendMessage(input: ContactInput): Promise<ContactMessage> {
    const senderName = input.username || input.name || 'Anonymous Reader';
    return this.contactRepository.create({
      name: senderName,
      email: input.email,
      message: input.message,
    });
  }

  public async getAllMessages(limit = 20, cursor?: string): Promise<PaginatedResult<ContactMessage>> {
    return this.contactRepository.findAll({ limit, cursor });
  }

  public async deleteMessage(id: string): Promise<void> {
    const message = await this.contactRepository.findById(id);
    if (!message) {
      throw new NotFoundError('Contact message not found');
    }
    await this.contactRepository.deleteById(id);
  }
}
