import { prisma } from '../../infrastructure/database/prisma';

export class GetCustomerTicketsUseCase {
  async execute(userId: string) {
    return await prisma.supportTicket.findMany({
      where: { customerId: userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
