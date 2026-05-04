import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.post('/auth/login', controller.login.bind(controller));
  app.post('/auth/register', controller.register.bind(controller));
}
