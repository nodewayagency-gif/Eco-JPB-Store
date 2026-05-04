import { prisma } from '../../infrastructure/database/prisma';

export class ListCategoriesUseCase {
  async execute() {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
