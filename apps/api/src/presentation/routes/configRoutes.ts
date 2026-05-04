import { FastifyInstance } from 'fastify';
import { ConfigController } from '../controllers/ConfigController';

export async function configRoutes(app: FastifyInstance) {
  const controller = new ConfigController();

  app.get('/settings/company', controller.getCompanyConfig.bind(controller));
  app.get('/admin/settings/company', controller.getCompanyConfig.bind(controller));
  app.put('/admin/settings/company', controller.updateCompanyConfig.bind(controller));
}
