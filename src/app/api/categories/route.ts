import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Get categories error:", error);
    return NextResponse.json({ message: "Erro ao listar categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { name, slug, description, image } = await request.json();

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
        description,
        image
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json({ message: "Erro ao criar categoria" }, { status: 500 });
  }
}
