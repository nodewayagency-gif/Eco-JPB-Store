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

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { status } = await request.json();

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Update ticket status error:", error);
    return NextResponse.json({ message: "Erro ao atualizar status" }, { status: 500 });
  }
}
