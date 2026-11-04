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

    // Se este endereço for o padrão, desmarcar todos os outros do cliente
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false }
      });
    }

    if (addressId) {
      // Editar existente garantindo que pertence ao perfil autenticado (Anti-IDOR)
      const existingAddress = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerProfileId: profile.id }
      });

      if (!existingAddress) {
        return NextResponse.json({ message: "Endereço não encontrado ou acesso negado" }, { status: 404 });
      }

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
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ message: "ID do endereço não informado" }, { status: 400 });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: authUser.sub }
    });

    if (!profile) {
      return NextResponse.json({ message: "Perfil não encontrado" }, { status: 404 });
    }

    const existingAddress = await prisma.customerAddress.findFirst({
      where: { id: addressId, customerProfileId: profile.id }
    });

    if (!existingAddress) {
      return NextResponse.json({ message: "Endereço não encontrado ou acesso negado" }, { status: 404 });
    }

    await prisma.customerAddress.delete({
      where: { id: addressId }
    });

    return NextResponse.json({ success: true, message: "Endereço removido com sucesso" });
  } catch (error: any) {
    console.error("Delete address error:", error);
    return NextResponse.json({ message: "Erro ao excluir endereço" }, { status: 500 });
  }
}
