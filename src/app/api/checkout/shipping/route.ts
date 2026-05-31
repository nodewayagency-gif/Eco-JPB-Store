import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { destinationZip, items } = await req.json();

    if (!destinationZip || !items || !items.length) {
      return NextResponse.json({ message: "CEP de destino e itens são obrigatórios" }, { status: 400 });
    }

    // 1. Buscar o CEP de origem da configuração da empresa
    const companyConfig = await prisma.companyConfig.findFirst();
    const originZip = companyConfig?.originZipCode?.replace(/\D/g, "");

    if (!originZip) {
      return NextResponse.json({ message: "CEP de origem não configurado no sistema" }, { status: 400 });
    }

    // 2. Buscar dados reais dos produtos para evitar manipulação de peso/dimensões
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
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

    // 3. Identificar produtos pagantes vs gratuitos
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
          width: width > 0 ? width : 20,
          height: height > 0 ? height : 20,
          length: length > 0 ? length : 40,
          weight: weight > 0 ? weight : 0.3,
          quantity: item.quantity,
        };
      });

    // Se TODOS os itens do carrinho tem frete grátis, retornar opção de Frete Grátis
    if (payloadProducts.length === 0) {
      return NextResponse.json([{
        id: "free-shipping",
        name: "Frete Grátis",
        company: "Logística JPB",
        price: 0,
        deliveryTime: 7,
        currency: "BRL"
      }]);
    }

    let token = process.env.MELHOR_ENVIO_TOKEN;
    let isTestMode = process.env.MELHOR_ENVIO_MODE === 'test';

    if (isTestMode) {
      token = process.env.MELHOR_ENVIO_TEST_TOKEN || token;
    }

    if (!token) {
      console.error("Token do Melhor Envio não configurado.");
      return NextResponse.json({ message: "Integração de frete indisponível" }, { status: 500 });
    }

    const payload = {
      from: {
        postal_code: originZip
      },
      to: {
        postal_code: destinationZip.replace(/\D/g, "")
      },
      products: payloadProducts,
      options: {
        receipt: false,
        own_hand: false
      },
      services: "1,2,18" // 1: PAC, 2: SEDEX, 18: Jadlog, etc.
    };

    // 4. Fazer a requisição
    const baseUrl = isTestMode ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
    const response = await axios.post(`${baseUrl}/api/v2/me/shipment/calculate`, payload, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JPB-Store breno.parizotto10@gmail.com'
      }
    });

    // 5. Filtrar e formatar as opções válidas
    const validOptions = response.data.filter((option: any) => !option.error && option.price);

    const shippingOptions = validOptions.map((option: any) => ({
      id: option.id,
      name: option.name,
      company: option.company?.name || option.name,
      price: Number(option.price),
      deliveryTime: option.custom_delivery_time || option.delivery_time,
      currency: option.currency || 'BRL'
    }));

    return NextResponse.json(shippingOptions);

  } catch (error: any) {
    console.error("Shipping calculate error:", error?.response?.data || error.message);
    return NextResponse.json(
      { message: "Erro ao calcular frete", error: error?.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
