import { NextResponse } from "next/server";
import { getActiveCheckoutRules } from "@/lib/checkoutRules";

export async function GET() {
  try {
    const rules = await getActiveCheckoutRules();
    
    // Format sanitized public response
    const formatted = rules.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      type: r.type,
      minSubtotal: r.minSubtotal ? Number(r.minSubtotal) : null,
      discountPercentage: r.discountPercentage ? Number(r.discountPercentage) : null,
      discountFixed: r.discountFixed ? Number(r.discountFixed) : null,
      paymentMethod: r.paymentMethod,
      targetStates: r.targetStates,
      startDate: r.startDate,
      endDate: r.endDate
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Get active checkout rules error:", error);
    return NextResponse.json({ message: "Erro ao consultar regras ativas" }, { status: 500 });
  }
}

