import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { addressId, title, zipCode, street, number, complement, neighborhood, city, state, isDefault } = data;

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: authUser.sub }
    });

    if (!profile) {
      return NextResponse.json({ message: "Perfil não encontrado" }, { status: 404 });
    }

    // Se este endereço for o padrão, desmarcar todos os outros
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false }
      });
    }

    if (addressId) {
      // Editar existente
      await prisma.customerAddress.update({
        where: { id: addressId },
        data: {
          title: title || 'Endereço',
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          isDefault: !!isDefault
        }
      });
    } else {
      // Criar novo
      await prisma.customerAddress.create({
        data: {
          customerProfileId: profile.id,
          title: title || 'Novo Endereço',
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          isDefault: !!isDefault
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update address error:", error);
    return NextResponse.json({ message: "Erro interno no servidor", error: error.message }, { status: 500 });
  }
}
