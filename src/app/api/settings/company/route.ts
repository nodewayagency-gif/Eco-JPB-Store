import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const config = await prisma.companyConfig.findFirst();
    if (!config) {
      return NextResponse.json({
        companyName: "JPB Store LTDA",
        tradeName: "JPB Store",
        document: "00.000.000/0001-00",
        email: "financeiro@jpb.com",
        phone: "(11) 4002-8922",
        originZipCode: "01001-000",
        addressLine: "Rua Aurora, 450",
        city: "São Paulo",
        state: "SP",
        instagramUrl: "https://instagram.com/jpbstore"
      });
    }
    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error getting company config:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const config = await prisma.companyConfig.findFirst();
    
    let updatedConfig;
    if (config) {
      updatedConfig = await prisma.companyConfig.update({
        where: { id: config.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } else {
      updatedConfig = await prisma.companyConfig.create({
        data
      });
    }
    return NextResponse.json(updatedConfig);
  } catch (error: any) {
    console.error('Error updating company config:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
