import { prisma } from '../../infrastructure/database/prisma';
import bcrypt from 'bcrypt';

export class RegisterUseCase {
  async execute(data: any) {
    const { email, password, name, document, documentType, phone, zipCode, street, number, complement, neighborhood, city, state } = data;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('E-mail já cadastrado');

    // Verificar se documento já existe
    if (document) {
      const existingDoc = await prisma.customerProfile.findUnique({ where: { document } });
      if (existingDoc) throw new Error('CPF/CNPJ já cadastrado');
    }

    // Criar Hash da Senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar Usuário e Perfil em transação
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name, // Salvando o nome na tabela de usuário também
          passwordHash,
          role: 'CUSTOMER',
        }
      });

      const profile = await tx.customerProfile.create({
        data: {
          userId: user.id,
          name,
          phone,
          document,
          documentType,
        }
      });

      // Criar Endereço
      if (zipCode) {
        await tx.customerAddress.create({
          data: {
            customerProfileId: profile.id,
            title: 'Principal',
            zipCode,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            isDefault: true
          }
        });
      }

      return {
        id: user.id,
        displayName: profile.name,
        email: user.email,
        role: user.role,
        image: user.image,
        status: 'ACTIVE'
      };
    });
  }
}
