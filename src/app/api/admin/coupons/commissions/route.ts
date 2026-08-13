import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Default to current month/year if not provided
    const currentDate = new Date();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : currentDate.getMonth() + 1;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : currentDate.getFullYear();

    // Calculate the start and end of the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const coupons = await prisma.coupon.findMany({
      where: {
        orders: {
          some: {
            paidAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      include: {
        orders: {
          where: {
            paidAt: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            id: true,
            total: true
          }
        }
      }
    });

    const result = coupons.map(coupon => {
      let commissionTotal = 0;
      let revenueTotal = 0;
      
      const commissionPercent = coupon.commissionPercent ? Number(coupon.commissionPercent) : 0;

      coupon.orders.forEach(order => {
        const orderTotal = Number(order.total);
        revenueTotal += orderTotal;
        commissionTotal += orderTotal * (commissionPercent / 100);
      });

      return {
        id: coupon.id,
        code: coupon.code,
        commissionPercent: commissionPercent,
        usageCount: coupon.orders.length,
        revenueTotal: revenueTotal,
        commissionTotal: commissionTotal
      };
    });

    // Sort by highest commission total
    result.sort((a, b) => b.commissionTotal - a.commissionTotal);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get coupon commissions error:", error);
    return NextResponse.json({ message: "Erro ao listar comissões" }, { status: 500 });
  }
}
