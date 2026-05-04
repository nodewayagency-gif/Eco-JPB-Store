import { prisma } from '../../infrastructure/database/prisma';

export class DeleteProductUseCase {
  async execute(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }
}
