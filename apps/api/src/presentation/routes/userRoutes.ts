import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';

export async function userRoutes(app: FastifyInstance) {
  const controller = new UserController();

  app.get('/admin/users', controller.listAll.bind(controller));
  app.patch('/admin/users/:id/password', controller.updatePassword.bind(controller));
}
