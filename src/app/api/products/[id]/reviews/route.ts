import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Using prisma to fetch reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = reviews.map(r => ({
      id: r.id,
      productId: r.productId,
      authorName: r.authorName || r.userId || "Cliente",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString()
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error listing reviews:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const { authorName, rating, comment } = body;

    if (!authorName || !rating) {
      return NextResponse.json({ error: "Name and rating are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        authorName,
        rating: Number(rating),
        comment: comment || "",
        status: "APPROVED",
      }
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

    return NextResponse.json({
      id: review.id,
      productId: review.productId,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
