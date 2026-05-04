import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        customerProfile: true
      },
      take: 100,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Get admin users error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { email, name, role, status } = data;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        status,
        // Senha padrão ou vazia se não fornecida (idealmente pedir senha no create)
        password: "changeme" 
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Create admin user error:", error);
    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 });
  }
}
