import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
    }

    const isStaff = authUser.role === 'ADMIN' || authUser.role === 'OPERATOR';
    const isOwner = ticket.customerId === authUser.sub || ticket.customerEmail === authUser.email;

    if (!isStaff && !isOwner) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Get support ticket detail error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
