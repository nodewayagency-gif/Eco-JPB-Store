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
    const mappedOrders = orders.map(order => {
      const statusMap: Record<string, string> = {
        CREATED: 'Aguardando Pagamento',
        PAID: 'Confirmado',
        SHIPPED: 'Em Trânsito',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado'
      };

      const primaryItem = order.items[0];
      const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

      return {
        id: order.id,
        orderCode: order.orderCode,
        date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
        status: statusMap[order.status] || 'Processando',
        total: Number(order.total),
        product: primaryItem?.product?.name 
          ? (order.items.length > 1 ? `${primaryItem.product.name} (+${order.items.length - 1} itens)` : primaryItem.product.name)
          : 'Pedido JPB Store',
        itemsCount,
        items: order.items.map(item => ({
          id: item.id,
          name: item.product?.name || 'Produto',
          quantity: item.quantity,
          price: Number(item.unitPrice),
          image: item.product?.image || item.product?.images?.[0] || ''
        })),
        productImage: primaryItem?.product?.image || primaryItem?.product?.images?.[0] || '',
        tracking: order.steps
          .sort((a, b) => stepOrder.indexOf(a.key) - stepOrder.indexOf(b.key))
          .map(step => ({
            title: step.label,
            description: '',
            date: step.completed ? new Date(step.updatedAt).toLocaleDateString('pt-BR') : '',
            completed: step.completed,
            active: step.active
          })),
        trackingCode: order.trackingCode || undefined
      };
    });

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("Get customer orders error full details:", error);
    return NextResponse.json({ message: "Erro interno no servidor", error: error.message }, { status: 500 });
  }
}
