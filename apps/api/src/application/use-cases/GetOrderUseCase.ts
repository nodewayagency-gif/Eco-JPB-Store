import { prisma } from '../../infrastructure/database/prisma';

export class GetOrderUseCase {
  async execute(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
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
      }
    });
  }
}
