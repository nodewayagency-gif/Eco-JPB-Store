import { FastifyReply, FastifyRequest } from 'fastify';
import { 
  ListCouponsUseCase, 
  CreateCouponUseCase, 
  UpdateCouponUseCase, 
  DeleteCouponUseCase,
  ValidateCouponUseCase 
} from '../../application/use-cases/CouponUseCases';

export class CouponController {
  private listCouponsUseCase = new ListCouponsUseCase();
  private createCouponUseCase = new CreateCouponUseCase();
  private updateCouponUseCase = new UpdateCouponUseCase();
  private deleteCouponUseCase = new DeleteCouponUseCase();
  private validateCouponUseCase = new ValidateCouponUseCase();

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const coupons = await this.listCouponsUseCase.execute();
      return reply.send(coupons);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao listar cupons', error });
    }
  }

  async create(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const coupon = await this.createCouponUseCase.execute(request.body);
      return reply.status(201).send(coupon);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao criar cupom', error });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const coupon = await this.updateCouponUseCase.execute(id, request.body);
      return reply.send(coupon);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao atualizar cupom', error });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await this.deleteCouponUseCase.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao deletar cupom', error });
    }
  }

  async validate(request: FastifyRequest<{ Body: { code: string; amount: number } }>, reply: FastifyReply) {
    try {
      const { code, amount } = request.body;
      const coupon = await this.validateCouponUseCase.execute(code, amount);
      return reply.send(coupon);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
