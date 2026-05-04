import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const settings = await prisma.companyConfig.findFirst();

    if (!settings) {
      return NextResponse.json({
        companyName: "Minha Loja",
        tradeName: "Minha Loja",
        document: "",
        email: "",
        phone: "",
        originZipCode: "",
        addressLine: "",
        city: "",
        state: ""
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Get company settings error:", error);
    return NextResponse.json({ message: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const existing = await prisma.companyConfig.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.companyConfig.update({
        where: { id: existing.id },
        data
      });
    } else {
      settings = await prisma.companyConfig.create({
        data
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Save company settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
