import { FastifyInstance } from 'fastify';
import { CategoryController } from '../controllers/CategoryController';

export async function categoryRoutes(app: FastifyInstance) {
  const controller = new CategoryController();

  app.get('/categories', controller.list.bind(controller));
  app.post('/categories', controller.create.bind(controller));
  app.put('/categories/:id', controller.update.bind(controller));
  app.delete('/categories/:id', controller.delete.bind(controller));
}
