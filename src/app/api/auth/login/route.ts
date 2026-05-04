import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'premium-electronics-secret-key-2024';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        { message: "Sua conta está desativada. Por favor, entre em contato com o suporte." },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { message: "Este usuário não possui senha configurada" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Senha incorreta" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.customerProfile?.name || user.name || "",
        email: user.email,
        role: user.role,
        image: user.image,
        status: (user as any).status || "ACTIVE",
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error full details:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor", error: error.message },
      { status: 500 }
    );
  }
}
