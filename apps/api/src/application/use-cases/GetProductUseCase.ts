import { prisma } from '../../infrastructure/database/prisma';

export class GetProductUseCase {
  async execute(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });
  }
}
