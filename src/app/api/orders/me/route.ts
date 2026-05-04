import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: authUser.sub },
          { guestEmail: authUser.email }
        ]
      },
      include: {
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Ordenação lógica dos passos
    const stepOrder = [
      'created',
      'paid',
      'in_separation',
      'ready_for_shipping',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];

    // Map to frontend format
    const mappedOrders = orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
      status: order.status === 'PAID' ? 'Confirmado' : order.status === 'SHIPPED' ? 'Em Trânsito' : order.status === 'DELIVERED' ? 'Entregue' : 'Processando',
      total: Number(order.total),
      product: order.items[0]?.product?.name || 'Pedido JPB Store',
      productImage: order.items[0]?.product?.image || order.items[0]?.product?.images?.[0] || '',
      tracking: order.steps
        .sort((a, b) => stepOrder.indexOf(a.key) - stepOrder.indexOf(b.key))
        .map(step => ({
          title: step.label,
          description: '',
          date: new Date(step.updatedAt).toLocaleDateString('pt-BR'),
          completed: step.completed,
          active: step.active
        }))
    }));

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("Get customer orders error full details:", error);
    return NextResponse.json({ message: "Erro interno no servidor", error: error.message }, { status: 500 });
  }
}
