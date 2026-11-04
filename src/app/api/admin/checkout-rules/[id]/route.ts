import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "OPERATOR")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      type,
      active,
      minSubtotal,
      discountPercentage,
      discountFixed,
      paymentMethod,
      targetStates,
      startDate,
      endDate,
      priority
    } = body;

    const updated = await prisma.checkoutRule.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(type && { type }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(minSubtotal !== undefined && { minSubtotal: minSubtotal ? Number(minSubtotal) : null }),
        ...(discountPercentage !== undefined && { discountPercentage: discountPercentage ? Number(discountPercentage) : null }),
        ...(discountFixed !== undefined && { discountFixed: discountFixed ? Number(discountFixed) : null }),
        ...(paymentMethod !== undefined && { paymentMethod: paymentMethod || null }),
        ...(targetStates !== undefined && { targetStates: Array.isArray(targetStates) ? targetStates : [] }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(priority !== undefined && { priority: Number(priority) || 0 })
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update checkout rule error:", error);
    return NextResponse.json({ message: "Erro ao atualizar regra", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    await prisma.checkoutRule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Regra removida com sucesso" });
  } catch (error: any) {
    console.error("Delete checkout rule error:", error);
    return NextResponse.json({ message: "Erro ao excluir regra", error: error.message }, { status: 500 });
  }
}

