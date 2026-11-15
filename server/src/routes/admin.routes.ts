import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminLoginSchema } from '../validators/auth.validator.js';

export const createAdminRouter = (adminController: AdminController): Router => {
  const router = Router();

  router.post('/login', validate(adminLoginSchema), adminController.login);

  router.use(authMiddleware);
  router.use(adminMiddleware);

  router.get('/users', adminController.getUsers);
  router.delete('/:id/delete/user', adminController.deleteUser);
  router.get('/:id/posts', adminController.getUserPosts);
  router.get('/posts', adminController.getPosts);
  router.get('/contacts', adminController.getContacts);
  router.delete('/:id/delete/msg', adminController.deleteContact);

  return router;
};
