import { prisma } from '../../infrastructure/database/prisma';
import { CreateSupportTicketInput } from '@premium/contracts';

export class CreateSupportTicketUseCase {
  async execute(userId: string, input: CreateSupportTicketInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true }
    });

    if (!user) throw new Error('User not found');

    return await prisma.supportTicket.create({
      data: {
        customerId: userId,
        customerName: user.name || 'Cliente',
        customerEmail: user.email,
        subject: input.subject,
        description: input.description,
        orderId: input.orderId,
        images: input.images || [],
        status: 'OPEN',
      },
      include: {
        messages: true
      }
    });
  }
}
