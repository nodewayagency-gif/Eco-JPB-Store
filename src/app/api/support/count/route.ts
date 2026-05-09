import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const count = await prisma.supportTicket.count({
      where: { status: "OPEN" }
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Get support count error:", error);
    return NextResponse.json({ message: "Erro", count: 0 }, { status: 500 });
  }
}

