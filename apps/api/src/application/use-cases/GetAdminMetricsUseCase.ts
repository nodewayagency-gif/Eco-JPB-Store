import { prisma } from '../../infrastructure/database/prisma';

export class GetAdminMetricsUseCase {
  async execute() {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true }
    });
    
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

    const pendingOrders = await prisma.order.count({
      where: { status: 'CREATED' }
    });

    // Simulando crescimento para o mock do dashboard (ou poderíamos calcular com base no mês passado)
    return {
      revenue: {
        value: Number(totalRevenue._sum.total || 0),
        trend: 12.5,
        trendDirection: "up" as const
      },
      orders: {
        value: totalOrders,
        trend: 8.2,
        trendDirection: "up" as const
      },
      customers: {
        value: totalCustomers,
        trend: 5.1,
        trendDirection: "up" as const
      },
      conversionRate: {
        value: 3.2,
        trend: -0.4,
        trendDirection: "down" as const
      }
    };
  }
}
