import { prisma } from '../../infrastructure/database/prisma';

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  image?: string;
  active?: boolean;
}

export class UpdateCategoryUseCase {
  async execute(id: string, data: UpdateCategoryDTO) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: data.name ? data.name.toLowerCase().replace(/ /g, '-') : undefined,
      },
    });
  }
}
