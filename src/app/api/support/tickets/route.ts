import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const tickets = await prisma.supportTicket.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("Get support tickets error:", error);
    return NextResponse.json({ message: "Erro ao listar chamados" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { subject, description, orderId, images } = await req.json();

    if (!subject || !description) {
      return NextResponse.json({ message: "Assunto e descrição são obrigatórios" }, { status: 400 });
    }

    // Buscar informações do perfil do cliente
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: authUser.sub }
    });

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: authUser.sub,
        customerName: profile?.name || authUser.email.split('@')[0],
        customerEmail: authUser.email,
        subject,
        description,
        orderId: orderId || null,
        images: images || [],
        status: "OPEN"
      }
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Create support ticket error:", error);
    return NextResponse.json({ message: "Erro ao criar chamado", error: error.message }, { status: 500 });
  }
}
