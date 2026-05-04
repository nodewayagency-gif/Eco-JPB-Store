import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

function mapStatus(status: string) {
  const labels: Record<string, string> = {
    CREATED: "Pendente",
    PAID: "Aprovado",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado"
  };
  return labels[status] || "Processando";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    const items = await prisma.orderItem.findMany({
      where: { productId: id },
      include: {
        order: {
          include: {
            customer: {
              include: {
                customerProfile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const history = items.map(item => ({
      id: item.id,
      productId: item.productId,
      orderCode: `#JPB-${item.order.id.slice(-4).toUpperCase()}`,
      customerName: item.order.guestName || item.order.customer?.customerProfile?.name || item.order.customer?.name || "Cliente",
      date: item.order.createdAt.toISOString().split('T')[0],
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.unitPrice) * item.quantity,
      paymentStatus: mapStatus(item.order.status),
      paymentGateway: item.order.paymentGateway || "N/A",
      shippingCarrier: item.order.shippingCarrier || "N/A",
      shippingQuoteId: item.order.shippingQuoteId || "N/A"
    }));
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error getting product history:', error);
    return NextResponse.json({ message: 'Erro ao buscar histórico do produto' }, { status: 500 });
  }
}
