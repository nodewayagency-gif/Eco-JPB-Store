import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "OPERATOR")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const rules = await prisma.checkoutRule.findMany({
      orderBy: [
        { active: "desc" },
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json(rules);
  } catch (error: any) {
    console.error("List checkout rules error:", error);
    return NextResponse.json({ message: "Erro ao listar regras" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    if (!name || !type) {
      return NextResponse.json({ message: "Nome e tipo de regra são obrigatórios" }, { status: 400 });
    }

    const rule = await prisma.checkoutRule.create({
      data: {
        name,
        description: description || null,
        type,
        active: active !== undefined ? Boolean(active) : true,
        minSubtotal: minSubtotal ? Number(minSubtotal) : null,
        discountPercentage: discountPercentage ? Number(discountPercentage) : null,
        discountFixed: discountFixed ? Number(discountFixed) : null,
        paymentMethod: paymentMethod || null,
        targetStates: Array.isArray(targetStates) ? targetStates : [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority ? Number(priority) : 0
      }
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error("Create checkout rule error:", error);
    return NextResponse.json({ message: "Erro ao criar regra de checkout", error: error.message }, { status: 500 });
  }
}

