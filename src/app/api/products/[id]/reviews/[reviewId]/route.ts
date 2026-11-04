import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const params = await context.params;
    const { id, reviewId } = params;

    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Atualiza a média de avaliações do produto
    const allReviews = await prisma.review.findMany({
      where: { productId: id, status: "APPROVED" }
    });

    const count = allReviews.length;
    const avg = count > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await prisma.product.update({
      where: { id },
      data: {
        reviewCount: count,
        rating: Number(avg.toFixed(1))
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ message: "Erro ao excluir avaliação" }, { status: 500 });
  }
}
