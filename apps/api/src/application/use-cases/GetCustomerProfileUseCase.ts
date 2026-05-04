import { prisma } from '../../infrastructure/database/prisma';

export class GetCustomerProfileUseCase {
  async execute(userId: string) {
    let profile = await prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        addresses: true
      }
    });

    if (!profile) {
      console.log(`[API] Perfil não encontrado para o userId ${userId}. Criando perfil básico...`);
      // Buscar dados do usuário para pegar o nome
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          name: user?.name || "Cliente",
        },
        include: {
          addresses: true
        }
      });
    }

    console.log(`[API] Perfil identificado para ${profile.name}.`);
    const address = profile.addresses.find(a => a.isDefault) || profile.addresses[0] || null;
    console.log(`[API] Endereço identificado:`, address ? "SIM" : "NÃO");

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      phone: profile.phone,
      document: profile.document,
      documentType: profile.documentType,
      address,
      addresses: profile.addresses
    };
  }
}
