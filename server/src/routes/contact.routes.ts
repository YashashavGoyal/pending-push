import { FastifyInstance } from 'fastify';
import { ContactController } from '../controllers/contact.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';

export const registerContactRoutes = (fastify: FastifyInstance, contactController: ContactController): void => {
  fastify.post(
    '/send',
    {
      preHandler: validateBody(contactSchema),
      schema: {
        description: 'Send a contact inquiry or feedback',
        tags: ['Contact'],
      },
    },
    contactController.send
  );
};
