import { FastifyInstance } from 'fastify';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { GetCustomerOrdersUseCase } from '../../application/use-cases/GetCustomerOrdersUseCase';
import { OrderController } from '../controllers/OrderController';

export async function orderRoutes(app: FastifyInstance) {
  const createOrderUseCase = new CreateOrderUseCase();
  const getCustomerOrdersUseCase = new GetCustomerOrdersUseCase();
  const controller = new OrderController();

  // Todas as rotas de pedido exigem autenticação
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ message: 'Não autorizado' });
    }
  });

  // Rotas de Cliente
  app.post('/orders', async (request, reply) => {
    try {
      const userId = (request.user as any).sub;
      const data = request.body as any;

      const order = await createOrderUseCase.execute({
        userId,
        ...data
      });

      return reply.status(201).send(order);
    } catch (error: any) {
      console.error("[API] Erro ao criar pedido:", error.message);
      return reply.status(400).send({ message: error.message });
    }
  });

  app.get('/orders/me', async (request, reply) => {
    try {
      const userId = (request.user as any).sub;
      const orders = await getCustomerOrdersUseCase.execute(userId);
      return reply.send(orders);
    } catch (error: any) {
      console.error("[API] Erro ao buscar pedidos do cliente:", error.message);
      return reply.status(400).send({ message: error.message });
    }
  });

  // Rotas de Admin
  app.get('/admin/metrics', {
    preHandler: async (request, reply) => {
      const role = (request.user as any).role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.getMetrics.bind(controller)
  });

  app.get('/admin/orders', {
    preHandler: async (request, reply) => {
      const role = (request.user as any).role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.listAll.bind(controller)
  });

  app.get('/admin/orders/:id', {
    preHandler: async (request, reply) => {
      const role = (request.user as any).role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.getById.bind(controller)
  });

  app.patch('/admin/orders/:id/step', {
    preHandler: async (request, reply) => {
      const role = (request.user as any).role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.updateStep.bind(controller)
  });
}
