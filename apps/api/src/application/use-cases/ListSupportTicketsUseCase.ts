import { prisma } from '../../infrastructure/database/prisma';

export class ListSupportTicketsUseCase {
  async execute() {
    return await prisma.supportTicket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
