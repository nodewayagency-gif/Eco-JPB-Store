import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.sub },
      include: {
        customerProfile: {
          include: {
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    // Adaptando para o formato esperado pelo frontend
    return NextResponse.json({
      id: user.id,
      name: user.customerProfile?.name || user.name || "",
      email: user.email,
      phone: user.customerProfile?.phone || "",
      document: user.customerProfile?.document || "",
      documentType: user.customerProfile?.documentType || "CPF",
      address: user.customerProfile?.addresses.find((a) => a.isDefault) || null,
      addresses: user.customerProfile?.addresses || [],
    });
  } catch (error: any) {
    console.error("Get customer profile error:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
