import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import bcrypt from "bcrypt";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  image: true,
  customerProfile: true,
};

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: userSafeSelect,
      take: 100,
      orderBy: {
        name: 'asc'
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
    const { email, name, role, status, password } = data;

    if (!email || !name) {
      return NextResponse.json({ message: "Nome e e-mail são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Este e-mail já está em uso" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password || "changeme123", 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'OPERATOR',
        status: status || 'ACTIVE',
        passwordHash
      },
      select: userSafeSelect
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Create admin user error:", error);
    return NextResponse.json({ message: "Erro ao criar usuário" }, { status: 500 });
  }
}
