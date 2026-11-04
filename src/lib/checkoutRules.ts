import { prisma } from "@/lib/prisma";

export interface ActiveRulesResult {
  freeShippingRule: {
    id: string;
    name: string;
    minSubtotal: number;
    targetStates: string[];
    isEligible: boolean;
    remainingToFreeShipping: number;
  } | null;
  paymentDiscounts: Record<string, {
    ruleId: string;
    percentage: number;
    fixed: number;
  }>;
  minOrderRule: {
    minSubtotal: number;
    isEligible: boolean;
  } | null;
}

export async function getActiveCheckoutRules(): Promise<any[]> {
  try {
    const now = new Date();
    const rules = await prisma.checkoutRule.findMany({
      where: {
        active: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } }
        ]
      },
      orderBy: { priority: "desc" }
    });
    return rules;
  } catch (error) {
    console.error("Erro ao buscar regras de checkout:", error);
    return [];
  }
}

/**
 * Avalia se o carrinho tem direito a frete grátis promocional
 */
export async function evaluateShippingRules(subtotal: number, state?: string) {
  const rules = await getActiveCheckoutRules();
  const shippingRules = rules.filter(r => r.type === "FREE_SHIPPING");

  if (shippingRules.length === 0) {
    return { isEligible: false, rule: null, remaining: 0 };
  }

  const cleanState = (state || "").trim().toUpperCase();

  for (const rule of shippingRules) {
    const minSubtotal = Number(rule.minSubtotal || 0);
    const targetStates = (rule.targetStates || []).map((s: string) => s.toUpperCase());
    
    // Verifica se o estado é elegível (se targetStates estiver vazio, vale para o Brasil inteiro)
    const isStateAllowed = targetStates.length === 0 || !cleanState || targetStates.includes(cleanState);

    if (isStateAllowed) {
      if (subtotal >= minSubtotal) {
        return {
          isEligible: true,
          rule: {
            id: rule.id,
            name: rule.name,
            minSubtotal
          },
          remaining: 0
        };
      } else {
        return {
          isEligible: false,
          rule: {
            id: rule.id,
            name: rule.name,
            minSubtotal
          },
          remaining: Math.max(0, minSubtotal - subtotal)
        };
      }
    }
  }

  return { isEligible: false, rule: null, remaining: 0 };
}

/**
 * Avalia se o método de pagamento tem desconto adicional
 */
export async function evaluatePaymentDiscount(subtotal: number, paymentMethod: string) {
  const rules = await getActiveCheckoutRules();
  const cleanMethod = (paymentMethod || "").toUpperCase();

  const discountRules = rules.filter(
    r => r.type === "PAYMENT_DISCOUNT" && (!r.paymentMethod || r.paymentMethod.toUpperCase() === cleanMethod)
  );

  if (discountRules.length === 0) {
    return { discountAmount: 0, percentage: 0, rule: null };
  }

  // Pega a regra de maior prioridade
  const rule = discountRules[0];
  const percentage = Number(rule.discountPercentage || 0);
  const fixed = Number(rule.discountFixed || 0);

  let discountAmount = 0;
  if (percentage > 0) {
    discountAmount = (subtotal * percentage) / 100;
  } else if (fixed > 0) {
    discountAmount = Math.min(subtotal, fixed);
  }

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    percentage,
    rule: {
      id: rule.id,
      name: rule.name
    }
  };
}

/**
 * Avalia se o pedido atinge o valor mínimo configurado
 */
export async function evaluateMinOrderValue(subtotal: number) {
  const rules = await getActiveCheckoutRules();
  const minRules = rules.filter(r => r.type === "MIN_ORDER_VALUE");

  if (minRules.length === 0) {
    return { isAllowed: true, minSubtotal: 0 };
  }

  const rule = minRules[0];
  const minSubtotal = Number(rule.minSubtotal || 0);

  return {
    isAllowed: subtotal >= minSubtotal,
    minSubtotal
  };
}

