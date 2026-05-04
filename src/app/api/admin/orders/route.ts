import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
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
      },
      take: 50, // Essencial para não travar o painel em produção
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Get admin orders error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
