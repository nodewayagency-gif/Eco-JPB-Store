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

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            customerProfile: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        steps: {
          orderBy: {
            updatedAt: 'asc'
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Get admin order detail error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
