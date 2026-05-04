import { prisma } from '../../infrastructure/database/prisma';

export class ListUsersUseCase {
  async execute() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        customerProfile: {
          select: {
            name: true
          }
        }
      }
    });
  }
}
