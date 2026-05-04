import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { password } = await request.json();

    if (!password || password.length < 4) {
      return NextResponse.json({ message: "Senha inválida" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { password }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso" });
  } catch (error: any) {
    console.error("Update user password error:", error);
    return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 });
  }
}
