import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/ProductController';

export async function productRoutes(app: FastifyInstance) {
  const controller = new ProductController();

  app.get('/products', controller.list.bind(controller));
  app.get('/products/:id', controller.get.bind(controller));
  app.post('/products', controller.create.bind(controller));
  app.put('/products/:id', controller.update.bind(controller));
  app.delete('/products/:id', controller.delete.bind(controller));
}
