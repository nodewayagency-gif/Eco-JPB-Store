import { prisma } from '../../infrastructure/database/prisma';

export class DeleteCategoryUseCase {
  async execute(id: string) {
    // Verificar se existem produtos vinculados antes de deletar (opcional, Prisma pode impedir se houver relação)
    return await prisma.category.delete({
      where: { id },
    });
  }
}
