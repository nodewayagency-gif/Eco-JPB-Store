import { prisma } from '../../infrastructure/database/prisma';

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  image?: string;
}

export class CreateCategoryUseCase {
  async execute(data: CreateCategoryDTO) {
    return await prisma.category.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/ /g, '-'),
      },
    });
  }
}
