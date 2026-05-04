import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCustomerProfileUseCase } from '../../application/use-cases/GetCustomerProfileUseCase';
import { UpdateCustomerAddressUseCase } from '../../application/use-cases/UpdateCustomerAddressUseCase';

export class CustomerController {
  private getProfileUseCase = new GetCustomerProfileUseCase();
  private updateAddressUseCase = new UpdateCustomerAddressUseCase();

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    // ... existing getMe
    try {
      const userId = (request.user as any).sub;
      const profile = await this.getProfileUseCase.execute(userId);
      return reply.send(profile);
    } catch (error: any) {
      console.error(`[API] Erro ao buscar perfil:`, error.message);
      return reply.status(500).send({ message: "Erro ao buscar perfil." });
    }
  }

  async updateAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).sub;
      const data = request.body as any;

      const address = await this.updateAddressUseCase.execute({
        userId,
        ...data
      });

      return reply.send(address);
    } catch (error: any) {
      console.error(`[API] Erro ao atualizar endereço:`, error.message);
      return reply.status(400).send({ message: error.message });
    }
  }
}
