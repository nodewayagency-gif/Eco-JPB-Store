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

    const { name, slug, description, image } = await request.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json({ message: "Erro ao atualizar categoria" }, { status: 500 });
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

    await prisma.category.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json({ message: "Erro ao excluir categoria" }, { status: 500 });
  }
}
