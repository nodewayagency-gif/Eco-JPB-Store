import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { status } = data;

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ message: "Erro ao atualizar lead" }, { status: 500 });
  }
}
