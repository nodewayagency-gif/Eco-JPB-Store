import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error listing leads:', error);
    return NextResponse.json({ message: 'Erro ao listar leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, phone, productId, productName } = data;

    if (!name || !phone) {
      return NextResponse.json({ message: 'Nome e telefone são obrigatórios' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        productId,
        productName
      }
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ message: 'Erro ao criar lead' }, { status: 500 });
  }
}
