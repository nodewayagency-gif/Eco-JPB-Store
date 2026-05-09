import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    // Busca todos os dados necessários em paralelo com seleções otimizadas
    const [totalRevenue, ordersCount, customersCount, recentOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true }
      }),
      prisma.order.count(),
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          guestName: true,
          createdAt: true,
          customer: {
            select: {
              customerProfile: {
                select: {
                  name: true
                }
              }
            }
          },
          steps: {
            where: { active: true },
            take: 1,
            select: {
              label: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Mapeia os dados para o formato esperado pela UI
    const metrics = [
      {
        title: "Receita Total",
        value: Number(totalRevenue._sum.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        change: "+12.5%",
        trend: "up"
      },
      {
        title: "Pedidos",
        value: ordersCount.toString(),
        change: "+8.2%",
        trend: "up"
      },
      {
        title: "Clientes",
        value: customersCount.toString(),
        change: "+5.1%",
        trend: "up"
      },
      {
        title: "Taxa de Conversão",
        value: "3.2%",
        change: "+0.4%",
        trend: "up"
      }
    ];

    const formattedOrders = recentOrders.map((order) => {
      const activeStep = order.steps[0];
      const statusLabel = activeStep 
        ? activeStep.label.replace("Pedido ", "").replace("Em ", "") 
        : "Processando";

      return {
        id: order.id,
        customerName: order.guestName || (order.customer as any)?.customerProfile?.name || "Cliente",
        productName: "Ver detalhes", // Removido fetch de itens para performance
        total: Number(order.total),
        status: statusLabel
      };
    });

    return NextResponse.json({ metrics, orders: formattedOrders });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}

