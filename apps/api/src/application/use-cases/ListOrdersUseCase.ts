import { prisma } from '../../infrastructure/database/prisma';

export class ListOrdersUseCase {
  async execute() {
    return await prisma.order.findMany({
      include: {
        steps: {
          orderBy: { updatedAt: 'asc' }
        },
        items: {
          include: {
            product: true
          }
        },
        customer: {
          include: {
            customerProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
