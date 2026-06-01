import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "ID do pedido não fornecido" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: order.status,
    });
  } catch (error) {
    console.error("Erro ao buscar status do pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
