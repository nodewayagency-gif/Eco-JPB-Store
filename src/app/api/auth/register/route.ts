import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'premium-electronics-secret-key-2024';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name, document, documentType, phone, zipCode, street, number, complement, neighborhood, city, state } = data;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "E-mail, senha e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    // Verificar se documento já existe
    if (document) {
      const existingDoc = await prisma.customerProfile.findUnique({ where: { document } });
      if (existingDoc) {
        return NextResponse.json(
          { message: "CPF/CNPJ já cadastrado" },
          { status: 400 }
        );
      }
    }

    // Criar Hash da Senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar Usuário e Perfil em transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'CUSTOMER',
        }
      });

      const profile = await tx.customerProfile.create({
        data: {
          userId: user.id,
          name,
          phone,
          document,
          documentType,
        }
      });

      // Criar Endereço
      if (zipCode) {
        await tx.customerAddress.create({
          data: {
            customerProfileId: profile.id,
            title: 'Principal',
            zipCode,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            isDefault: true
          }
        });
      }

      return {
        id: user.id,
        displayName: profile.name,
        email: user.email,
        role: user.role,
        image: user.image,
        status: 'ACTIVE'
      };
    });

    const token = jwt.sign(
      {
        sub: result.id,
        role: result.role,
        email: result.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      user: result,
      token,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
