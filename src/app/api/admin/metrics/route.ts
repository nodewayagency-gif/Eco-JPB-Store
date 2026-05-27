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

    // Consultas em paralelo para performance máxima em produção
    const [
      totalRevenue, 
      ordersCount, 
      customersCount,
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
      if (previous === 0) return { trend: current > 0 ? 100 : 0, direction: current > 0 ? 'up' as const : 'neutral' as const };
      const percentage = ((current - previous) / previous) * 100;
      return { 
        trend: Number(Math.abs(percentage).toFixed(1)), 
        direction: percentage > 0 ? 'up' as const : percentage < 0 ? 'down' as const : 'neutral' as const 
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

    const metrics = {
      revenue: {
        value: Number(totalRevenue._sum.total || 0),
        trend: revTrend.trend,
        trendDirection: revTrend.direction
      },
      orders: {
        value: ordersCount,
        trend: ordTrend.trend,
        trendDirection: ordTrend.direction
      },
      customers: {
        value: customersCount,
        trend: custTrend.trend,
        trendDirection: custTrend.direction
      },
      conversionRate: {
        value: Number(currentConv.toFixed(1)),
        trend: convTrendData.trend,
        trendDirection: convTrendData.direction
      }
    };

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("Get admin metrics error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
