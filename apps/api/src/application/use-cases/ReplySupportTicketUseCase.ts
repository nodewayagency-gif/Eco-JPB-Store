import { prisma } from '../../infrastructure/database/prisma';
import { SendTicketMessageInput } from '@premium/contracts';

export class ReplySupportTicketUseCase {
  async execute(userId: string, ticketId: string, input: SendTicketMessageInput, senderRole: 'CUSTOMER' | 'ADMIN' | 'OPERATOR') {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('User not found');

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) throw new Error('Ticket not found');

    // Se for cliente, verificar se o ticket é dele
    if (senderRole === 'CUSTOMER' && ticket.customerId !== userId) {
      throw new Error('Unauthorized');
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderName: user.name || 'Usuário',
        senderRole,
        content: input.content,
        images: input.images || []
      }
    });

    // Atualizar updatedAt e mudar status para IN_PROGRESS se for a primeira resposta do admin
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { 
        updatedAt: new Date(),
        status: (senderRole === 'ADMIN' || senderRole === 'OPERATOR') && ticket.status === 'OPEN' 
          ? 'IN_PROGRESS' 
          : ticket.status
      }
    });

    return await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}
