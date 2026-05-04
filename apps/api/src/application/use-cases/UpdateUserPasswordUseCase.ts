import { prisma } from '../../infrastructure/database/prisma';
import bcrypt from 'bcrypt';

export class UpdateUserPasswordUseCase {
  async execute(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    return await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
}
