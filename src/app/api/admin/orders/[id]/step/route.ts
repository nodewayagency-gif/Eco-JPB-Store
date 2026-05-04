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
    const { id: orderId } = await params;
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { stepKey, source } = data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { steps: true }
    });

    if (!order) {
      return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
    }

    const stepOrder = [
      'created',
      'paid',
      'in_separation',
      'ready_for_shipping',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];

    const targetIndex = stepOrder.indexOf(stepKey);
    if (targetIndex === -1) {
      return NextResponse.json({ message: "Passo inválido" }, { status: 400 });
    }

    // Atualiza todos os passos até o alvo
    await Promise.all(order.steps.map(step => {
      const index = stepOrder.indexOf(step.key);
      let completed = false;
      let active = false;

      if (index < targetIndex) {
        completed = true;
        active = false;
      } else if (index === targetIndex) {
        completed = false;
        active = true;
      }

      return prisma.orderStep.update({
        where: { id: step.id },
        data: {
          completed,
          active,
          source: index === targetIndex ? (source || 'system') : step.source,
          updatedAt: new Date()
        }
      });
    }));

    // Atualiza o status principal do pedido se necessário
    let newStatus = order.status;
    if (stepKey === 'paid') newStatus = 'PAID';
    if (stepKey === 'shipped') newStatus = 'SHIPPED';
    if (stepKey === 'delivered') newStatus = 'DELIVERED';

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      },
      include: {
        steps: {
          orderBy: {
            updatedAt: 'asc'
          }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Update order step error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
