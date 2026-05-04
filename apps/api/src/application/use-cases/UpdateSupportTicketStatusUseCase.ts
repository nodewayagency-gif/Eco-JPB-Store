import { prisma } from '../../infrastructure/database/prisma';
import { TicketStatus } from '@premium/contracts';

export class UpdateSupportTicketStatusUseCase {
  async execute(ticketId: string, status: TicketStatus) {
    return await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}
