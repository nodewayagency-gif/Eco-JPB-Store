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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const lead = await prisma.lead.create({
      data: {
        email: data.email,
        productId: data.productId,
        productName: data.productName,
      },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ message: 'Erro ao capturar lead' }, { status: 500 });
  }
}
