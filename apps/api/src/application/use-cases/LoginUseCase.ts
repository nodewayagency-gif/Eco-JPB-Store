import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prisma';

export interface LoginDTO {
  email: string;
  password?: string; // Pode ser opcional se estivermos testando, mas obrigatório na lógica
}

export class LoginUseCase {
  async execute({ email, password }: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Se o usuário não tiver senha (ex: login social), mas estiver tentando via senha
    if (!user.passwordHash && password) {
      throw new Error('Este usuário não possui senha configurada');
    }

    if (password && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }
    }

    return user;
  }
}
