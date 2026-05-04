import { FastifyInstance } from 'fastify';
import { CustomerController } from '../controllers/CustomerController';

export async function customerRoutes(app: FastifyInstance) {
  console.log("[API] Registrando rotas de clientes...");
  const controller = new CustomerController();

  // Middleware para verificar JWT em todas as rotas do cliente
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  app.get('/customers/me', controller.getMe.bind(controller));
  app.put('/customers/address', controller.updateAddress.bind(controller));
}
