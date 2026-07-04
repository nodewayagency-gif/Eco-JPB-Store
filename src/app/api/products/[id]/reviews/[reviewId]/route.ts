import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { id: string, reviewId: string } }
) {
  try {
    const { id, reviewId } = params;
    
    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update product average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId: id, status: "APPROVED" }
    });

    const count = allReviews.length;
    const avg = count > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await prisma.product.update({
      where: { id },
      data: {
        reviewCount: count,
        rating: avg
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
