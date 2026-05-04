import { prisma } from '../../infrastructure/database/prisma';

export class ListProductsUseCase {
  async execute(onlyActive = false) {
    return await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      where: onlyActive ? { active: true } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
