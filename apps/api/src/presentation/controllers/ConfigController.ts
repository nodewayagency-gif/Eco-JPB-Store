import { FastifyRequest, FastifyReply } from 'fastify';
import { GetCompanyConfigUseCase, UpdateCompanyConfigUseCase } from '../../application/use-cases/ConfigUseCases';

const getUseCase = new GetCompanyConfigUseCase();
const updateUseCase = new UpdateCompanyConfigUseCase();

export class ConfigController {
  async getCompanyConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const config = await getUseCase.execute();
      return reply.send(config);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async updateCompanyConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const config = await updateUseCase.execute(data);
      return reply.send(config);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }
}
