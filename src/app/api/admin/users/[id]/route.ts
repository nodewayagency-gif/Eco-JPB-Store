import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { name, email, role, status } = data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        status
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Update admin user error:", error);
    return NextResponse.json({ message: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Usuário removido com sucesso" });
  } catch (error: any) {
    console.error("Delete admin user error:", error);
    return NextResponse.json({ message: "Erro ao remover usuário" }, { status: 500 });
  }
}
