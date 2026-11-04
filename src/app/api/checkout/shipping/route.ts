import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { evaluateShippingRules } from "@/lib/checkoutRules";

export async function POST(req: Request) {
  try {
    const { destinationZip, destinationState, items } = await req.json();

    if (!destinationZip || !items || !items.length) {
      return NextResponse.json({ message: "CEP de destino e itens são obrigatórios" }, { status: 400 });
    }

    // 1. Buscar o CEP de origem da configuração da empresa
    const companyConfig = await prisma.companyConfig.findFirst();
    const originZip = companyConfig?.originZipCode?.replace(/\D/g, "");

    if (!originZip) {
      return NextResponse.json({ message: "CEP de origem não configurado no sistema" }, { status: 400 });
    }

    // 2. Buscar dados reais dos produtos para evitar manipulação de peso/dimensões/preço
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        weightKg: true,
        widthCm: true,
        heightCm: true,
        lengthCm: true,
        freeShipping: true,
      }
    });

    if (!dbProducts.length) {
      return NextResponse.json({ message: "Produtos não encontrados" }, { status: 404 });
    }

    // 3. Calcular subtotal real para checagem de regras dinâmicas
    const subtotal = items.reduce((acc: number, item: any) => {
      const p = dbProducts.find((prod) => prod.id === item.productId);
      return acc + (Number(p?.price || 0) * (item.quantity || 1));
    }, 0);

    // 4. Avaliar regras ativas de Frete Grátis configuradas no Painel Admin
    const shippingRuleEvaluation = await evaluateShippingRules(subtotal, destinationState);

    // 5. Identificar produtos pagantes vs gratuitos
    const payloadProducts = items
      .filter((item: any) => {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        return !dbProduct?.freeShipping; // Apenas calcula os que NÃO tem frete grátis
      })
      .map((item: any) => {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        const width = Number(dbProduct?.widthCm || 20);
        const height = Number(dbProduct?.heightCm || 20);
        const length = Number(dbProduct?.lengthCm || 40);
        const weight = Number(dbProduct?.weightKg || 0.3);

        return {
          id: item.productId,
          width: width > 0 ? Math.ceil(width) : 20,
          height: height > 0 ? Math.ceil(height) : 20,
          length: length > 0 ? Math.ceil(length) : 40,
          weight: weight > 0 ? weight : 0.3,
          quantity: item.quantity,
        };
      });

    // Se todos os produtos tiverem frete grátis no cadastro OU se o carrinho atendeu à regra dinâmica do Admin
    if (payloadProducts.length === 0 || shippingRuleEvaluation.isEligible) {
      const freeOption = {
        id: "free-shipping",
        name: "Frete Grátis",
        company: shippingRuleEvaluation.isEligible ? (shippingRuleEvaluation.rule?.name || "Frete Grátis Promocional") : "Logística JPB",
        price: 0,
        deliveryTime: 6,
        currency: "BRL"
      };

      // Se elegível por regra do admin, podemos tentar cotar opções expressas (ex: Sedex) e colocar a grátis no topo
      if (shippingRuleEvaluation.isEligible && payloadProducts.length > 0) {
        try {
          const expressOptions = await fetchMelhorEnvioQuotes(originZip, destinationZip, payloadProducts);
          return NextResponse.json([freeOption, ...expressOptions.filter((o: any) => o.price > 0)]);
        } catch {
          return NextResponse.json([freeOption]);
        }
      }

      return NextResponse.json([freeOption]);
    }

    // Cotação normal via Melhor Envio
    const shippingOptions = await fetchMelhorEnvioQuotes(originZip, destinationZip, payloadProducts);
    return NextResponse.json(shippingOptions);

  } catch (error: any) {
    console.error("Shipping calculate error:", error?.response?.data || error.message);
    return NextResponse.json(
      { message: "Erro ao calcular frete", error: error?.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}

async function fetchMelhorEnvioQuotes(originZip: string, destinationZip: string, payloadProducts: any[]) {
  let token = process.env.MELHOR_ENVIO_TOKEN;
  let isTestMode = process.env.MELHOR_ENVIO_MODE === 'test';

  if (isTestMode) {
    token = process.env.MELHOR_ENVIO_TEST_TOKEN || token;
  }

  if (!token) {
    throw new Error("Token do Melhor Envio não configurado");
  }

  const payload = {
    from: { postal_code: originZip },
    to: { postal_code: destinationZip.replace(/\D/g, "") },
    products: payloadProducts,
    options: { receipt: false, own_hand: false },
    services: "1,2,18" // 1: PAC, 2: SEDEX, 18: Jadlog
  };

  const baseUrl = isTestMode ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
  const response = await axios.post(`${baseUrl}/api/v2/me/shipment/calculate`, payload, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'JPB-Store breno.parizotto10@gmail.com'
    }
  });

  const validOptions = (response.data || []).filter((option: any) => !option.error && option.price);

  return validOptions.map((option: any) => ({
    id: option.id,
    name: option.name,
    company: option.company?.name || option.name,
    price: Number(option.price),
    deliveryTime: option.custom_delivery_time || option.delivery_time,
    currency: option.currency || 'BRL'
  }));
}
