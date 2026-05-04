import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateSupportTicketUseCase } from '../../application/use-cases/CreateSupportTicketUseCase';
import { GetCustomerTicketsUseCase } from '../../application/use-cases/GetCustomerTicketsUseCase';
import { ListSupportTicketsUseCase } from '../../application/use-cases/ListSupportTicketsUseCase';
import { ReplySupportTicketUseCase } from '../../application/use-cases/ReplySupportTicketUseCase';
import { UpdateSupportTicketStatusUseCase } from '../../application/use-cases/UpdateSupportTicketStatusUseCase';
import { CreateSupportTicketInput, SendTicketMessageInput, TicketStatus } from '@premium/contracts';

export class SupportController {
  private createUseCase = new CreateSupportTicketUseCase();
  private getCustomerTicketsUseCase = new GetCustomerTicketsUseCase();
  private listAllUseCase = new ListSupportTicketsUseCase();
  private replyUseCase = new ReplySupportTicketUseCase();
  private updateStatusUseCase = new UpdateSupportTicketStatusUseCase();

  async create(request: FastifyRequest, reply: FastifyReply) {
    console.log("[SupportController] Create Request User:", request.user);
    const userId = (request.user as any).sub;
    const input = request.body as CreateSupportTicketInput;
    const ticket = await this.createUseCase.execute(userId, input);
    return reply.status(201).send(ticket);
  }

  async listMyTickets(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).sub;
    const tickets = await this.getCustomerTicketsUseCase.execute(userId);
    return reply.send(tickets);
  }

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const tickets = await this.listAllUseCase.execute();
    return reply.send(tickets);
  }

  async reply(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).sub;
    const { id } = request.params as { id: string };
    const input = request.body as SendTicketMessageInput;
    
    // Identificar role do usuário pelo JWT ou DB
    const userRole = (request.user as any).role;
    
    const ticket = await this.replyUseCase.execute(userId, id, input, userRole);
    return reply.send(ticket);
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: TicketStatus };
    const user = request.user as any;
    
    const logMsg = `[${new Date().toISOString()}] Tentativa de update: ID=${id}, Status=${status}, User=${user?.email}, Role=${user?.role}\n`;
    require('fs').appendFileSync('support_debug.log', logMsg);
    
    try {
      const ticket = await this.updateStatusUseCase.execute(id, status);
      require('fs').appendFileSync('support_debug.log', `[${new Date().toISOString()}] Sucesso: Novo status=${ticket.status}\n`);
      return reply.send(ticket);
    } catch (error: any) {
      require('fs').appendFileSync('support_debug.log', `[${new Date().toISOString()}] ERRO: ${error.message}\n`);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  }
}
