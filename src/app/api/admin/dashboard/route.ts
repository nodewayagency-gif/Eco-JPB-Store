import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Busca todos os dados necessários em paralelo com seleções otimizadas
    const [
      totalRevenue, 
      ordersCount, 
      customersCount,
      recentOrders,
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      currentPaidOrders,
      previousPaidOrders
    ] = await Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          guestName: true,
          createdAt: true,
          customer: { select: { customerProfile: { select: { name: true } } } },
          steps: { where: { active: true }, take: 1, select: { label: true } }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.aggregate({ where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { status: 'PAID', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.order.count({ where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({ where: { status: 'PAID', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return { trend: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' };
      const percentage = ((current - previous) / previous) * 100;
      return { 
        trend: Number(Math.abs(percentage).toFixed(1)), 
        direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral' 
      };
    };

    const revCurrent = Number(currentRevenue._sum.total || 0);
    const revPrevious = Number(previousRevenue._sum.total || 0);
    const revTrend = calculateTrend(revCurrent, revPrevious);

    const ordTrend = calculateTrend(currentOrders, previousOrders);
    const custTrend = calculateTrend(currentCustomers, previousCustomers);

    const currentConv = currentOrders > 0 ? (currentPaidOrders / currentOrders) * 100 : 0;
    const previousConv = previousOrders > 0 ? (previousPaidOrders / previousOrders) * 100 : 0;
    const convTrendData = calculateTrend(currentConv, previousConv);

    // Mapeia os dados para o formato esperado pela UI
    const metrics = [
      {
        title: "Receita Total",
        value: Number(totalRevenue._sum.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        change: `${revTrend.direction === 'up' ? '+' : revTrend.direction === 'down' ? '-' : ''}${revTrend.trend}%`,
        trend: revTrend.direction
      },
      {
        title: "Pedidos",
        value: ordersCount.toString(),
        change: `${ordTrend.direction === 'up' ? '+' : ordTrend.direction === 'down' ? '-' : ''}${ordTrend.trend}%`,
        trend: ordTrend.direction
      },
      {
        title: "Clientes",
        value: customersCount.toString(),
        change: `${custTrend.direction === 'up' ? '+' : custTrend.direction === 'down' ? '-' : ''}${custTrend.trend}%`,
        trend: custTrend.direction
      },
      {
        title: "Taxa de Conversão",
        value: `${currentConv.toFixed(1)}%`,
        change: `${convTrendData.direction === 'up' ? '+' : convTrendData.direction === 'down' ? '-' : ''}${convTrendData.trend}%`,
        trend: convTrendData.direction
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

