import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service.js';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  public send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.contactService.sendMessage(req.body);
      res.status(200).json({
        success: true,
        message: 'Message Sent Successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
