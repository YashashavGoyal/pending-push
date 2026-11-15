import { FastifyRequest, FastifyReply } from 'fastify';
import { ContactService } from '../services/contact.service.js';
import { ContactInput } from '../validators/contact.validator.js';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  public send = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as ContactInput;
    await this.contactService.sendMessage(body);
    reply.status(200).send({
      success: true,
      message: 'Message Sent Successfully',
    });
  };
}
