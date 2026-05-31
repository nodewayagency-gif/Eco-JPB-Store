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

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { trackingCode } = body;

    const order = await prisma.order.update({
      where: { id },
      data: { trackingCode },
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

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Update order tracking error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
