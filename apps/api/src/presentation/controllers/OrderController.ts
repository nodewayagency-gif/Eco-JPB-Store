import { FastifyRequest, FastifyReply } from 'fastify';
import { ListOrdersUseCase } from '../../application/use-cases/ListOrdersUseCase';
import { GetOrderUseCase } from '../../application/use-cases/GetOrderUseCase';
import { UpdateOrderStepUseCase } from '../../application/use-cases/UpdateOrderStepUseCase';
import { GetAdminMetricsUseCase } from '../../application/use-cases/GetAdminMetricsUseCase';

export class OrderController {
  private listOrdersUseCase = new ListOrdersUseCase();
  private getOrderUseCase = new GetOrderUseCase();
  private updateOrderStepUseCase = new UpdateOrderStepUseCase();
  private getMetricsUseCase = new GetAdminMetricsUseCase();

  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const metrics = await this.getMetricsUseCase.execute();
      return reply.send(metrics);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const orders = await this.listOrdersUseCase.execute();
      return reply.send(orders);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const order = await this.getOrderUseCase.execute(id);
      if (!order) return reply.status(404).send({ message: "Pedido não encontrado" });
      return reply.send(order);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async updateStep(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { stepKey, source } = request.body as { stepKey: string, source?: 'system' | 'manual' };
    try {
      const order = await this.updateOrderStepUseCase.execute({ orderId: id, stepKey, source });
      return reply.send(order);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
