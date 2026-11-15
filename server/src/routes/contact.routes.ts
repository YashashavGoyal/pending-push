import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';

export const createContactRouter = (contactController: ContactController): Router => {
  const router = Router();

  router.post('/send', validate(contactSchema), contactController.send);

  return router;
};
