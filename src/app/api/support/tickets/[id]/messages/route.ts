import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Buscar o chamado para verificar propriedade
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
    }

    const isStaff = authUser.role === 'ADMIN' || authUser.role === 'OPERATOR';
    const isOwner = ticket.customerId === authUser.sub;

    if (!isStaff && !isOwner) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const { content, images } = await request.json();

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: authUser.sub,
        senderName: isStaff ? "Equipe JPB" : (ticket.customerName || authUser.email),
        senderRole: authUser.role,
        content,
        images: images || []
      }
    });

    // Se o cliente responder, voltamos o status para OPEN se estiver CLOSED
    const newStatus = !isStaff && ticket.status === 'CLOSED' ? 'OPEN' : ticket.status;

    // Atualiza a data de modificação e status do chamado
    await prisma.supportTicket.update({
      where: { id },
      data: { 
        updatedAt: new Date(),
        status: newStatus
      }
    });

    // Buscar o chamado atualizado com todas as mensagens
    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error: any) {
    console.error("Reply ticket error:", error);
    return NextResponse.json({ message: "Erro ao responder chamado", error: error.message }, { status: 500 });
  }
}
