import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import bcrypt from "bcrypt";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso" });
  } catch (error: any) {
    console.error("Update user password error:", error);
    return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 });
  }
}
