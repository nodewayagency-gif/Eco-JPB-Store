import { FastifyInstance } from 'fastify';
import { SupportController } from '../controllers/SupportController';

export async function supportRoutes(app: FastifyInstance) {
  const controller = new SupportController();

  // Middleware para verificar JWT
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err: any) {
      require('fs').appendFileSync('support_debug.log', `[${new Date().toISOString()}] JWT ERROR: ${err.message}\n`);
      reply.send(err);
    }
  });

  // Rotas de Cliente
  app.post('/support/tickets', controller.create.bind(controller));
  app.get('/support/tickets/me', controller.listMyTickets.bind(controller));
  
  // Rotas Compartilhadas (Cliente e Admin podem responder)
  app.post('/support/tickets/:id/messages', controller.reply.bind(controller));

  // Rotas de Admin
  app.get('/support/tickets', {
    preHandler: async (request, reply) => {
      const role = (request.user as any).role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.listAll.bind(controller)
  });

  app.patch('/support/tickets/:id/status', {
    preHandler: async (request, reply) => {
      const user = request.user as any;
      const role = user?.role;
      const logMsg = `[${new Date().toISOString()}] PreHandler status check: User=${user?.email}, Role=${role}\n`;
      require('fs').appendFileSync('support_debug.log', logMsg);
      
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        require('fs').appendFileSync('support_debug.log', `[${new Date().toISOString()}] BLOQUEADO: Role insuficiente\n`);
        return reply.status(403).send({ message: 'Forbidden' });
      }
    },
    handler: controller.updateStatus.bind(controller)
  });
}
