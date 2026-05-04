import { prisma } from '../../infrastructure/database/prisma';

interface UpdateAddressInput {
  userId: string;
  addressId?: string; // Se enviado, edita. Se não, cria.
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  title: string;
  isDefault?: boolean;
}

export class UpdateCustomerAddressUseCase {
  async execute(input: UpdateAddressInput) {
    const { userId, addressId, ...addressData } = input;

    // Buscar o perfil do cliente
    const profile = await prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Perfil do cliente não encontrado');
    }

    // Se for o primeiro endereço ou marcado como default, desmarcar os outros
    if (addressData.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false }
      });
    }

    if (addressId) {
      // Editar endereço existente
      return await prisma.customerAddress.update({
        where: { id: addressId },
        data: {
          title: addressData.title,
          zipCode: addressData.zipCode,
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          isDefault: addressData.isDefault ?? false
        }
      });
    } else {
      // Criar novo endereço
      return await prisma.customerAddress.create({
        data: {
          customerProfileId: profile.id,
          title: addressData.title,
          zipCode: addressData.zipCode,
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          isDefault: addressData.isDefault ?? false
        }
      });
    }
  }
}
