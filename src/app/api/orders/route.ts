import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { getMpPreference } from "@/lib/mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, guestName, guestEmail, guestPhone, guestDocument, couponCode, couponId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "O carrinho está vazio" }, { status: 400 });
    }

    const authUser = await getAuthUser();

    // 1. Buscar produtos no banco para validar preços reais e integridade (Anti-Tampering)
    const productIds = items.map((item: any) => item.productId).filter(Boolean);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json({ message: "Um ou mais produtos não foram encontrados" }, { status: 400 });
    }

    // Calcular subtotal estritamente com base nos preços do banco de dados
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product) {
        throw new Error("Produto inválido");
      }
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Number(product.price);
      subtotal += unitPrice * quantity;

      return {
        productId: item.productId,
        quantity,
        unitPrice,
        variantId: item.variantId || null,
        productName: product.name
      };
    });

    // Validar e calcular frete
    const shippingCost = shippingAddress?.shippingCost ? Math.max(0, Number(shippingAddress.shippingCost)) : 0;

    // Processar e calcular desconto de cupom no servidor
    let validCouponCode: string | null = null;
    let validCouponId: string | null = null;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ 
        where: { code: String(couponCode).trim().toUpperCase() } 
      });

      if (coupon && coupon.active) {
        const isExpired = coupon.endDate ? new Date() > new Date(coupon.endDate) : false;
        const reachedMaxUses = coupon.maxUses ? coupon.usedCount >= coupon.maxUses : false;
        const reachedMinOrder = coupon.minOrderValue ? subtotal >= Number(coupon.minOrderValue) : true;

        if (!isExpired && !reachedMaxUses && reachedMinOrder) {
          validCouponCode = coupon.code;
          validCouponId = coupon.id;

          if (coupon.discountType === "PERCENTAGE") {
            discount = (subtotal * Number(coupon.discountValue)) / 100;
          } else {
            discount = Number(coupon.discountValue);
          }
          discount = Math.min(discount, subtotal);
        }
      }
    }

    // Recalcular Total oficial e inviolável no servidor
    const calculatedTotal = Number(Math.max(0, subtotal - discount + shippingCost).toFixed(2));

    // Gerar código do pedido único
    const orderCode = `JPB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 2. Criar o pedido no banco de dados com total auditado
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerId: authUser?.sub || null,
        guestName: !authUser ? guestName : null,
        guestEmail: !authUser ? guestEmail : null,
        guestPhone: !authUser ? guestPhone : null,
        guestDocument: !authUser ? guestDocument : null,
        total: calculatedTotal,
        status: "CREATED",
        paymentGateway: paymentMethod,
        couponCode: validCouponCode,
        couponId: validCouponId,
        shippingAddress: shippingAddress as any,
        shippingCost: shippingCost > 0 ? shippingCost : null,
        shippingCarrier: shippingAddress?.shippingCarrier || null,
        shippingMethod: shippingAddress?.shippingMethod || null,
        items: {
          create: validatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            variantId: item.variantId
          })),
        },
        steps: {
          create: [
            { key: "created", label: "Pedido Realizado", completed: true, active: false },
            { key: "waiting_payment", label: "Aguardando Pagamento", completed: false, active: true },
            { key: "paid", label: "Pagamento Confirmado", completed: false, active: false },
            { key: "in_separation", label: "Em Separação", completed: false, active: false },
            { key: "ready_for_shipping", label: "Pronto para Envio", completed: false, active: false },
            { key: "shipped", label: "Em Trânsito", completed: false, active: false },
            { key: "out_for_delivery", label: "Saiu para Entrega", completed: false, active: false },
            { key: "delivered", label: "Entregue", completed: false, active: false },
          ],
        },
      },
    });

    // 3. Integração com Mercado Pago (se selecionado)
    let paymentUrl = null;
    if (paymentMethod === 'MERCADO_PAGO' || paymentMethod === 'mercadopago') {
      const mpPreference = await getMpPreference();
      
      // Aplicar proporção de desconto aos itens para o Checkout Pro bater com calculatedTotal
      const discountRatio = subtotal > 0 ? Math.max(0, subtotal - discount) / subtotal : 1;
      const mpItems = validatedItems.map((item) => ({
        id: item.productId,
        title: item.productName || "Produto JPB Store",
        quantity: item.quantity,
        unit_price: Number((item.unitPrice * discountRatio).toFixed(2)),
        currency_id: 'BRL',
      }));

      // Adicionar frete como item explícito se houver
      if (shippingCost > 0) {
        mpItems.push({
          id: 'shipping-cost',
          title: `Frete (${shippingAddress?.shippingCarrier || 'Entrega'})`,
          quantity: 1,
          unit_price: Number(shippingCost.toFixed(2)),
          currency_id: 'BRL',
        });
      }

      const host = req.headers.get('host') || 'localhost:3000';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host.includes('localhost') ? `http://${host}` : `https://${host}`);

      const preference = await mpPreference.create({
        body: {
          items: mpItems,
          external_reference: order.id,
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
          back_urls: {
            success: `${baseUrl}/checkout/success?orderId=${order.id}`,
            failure: `${baseUrl}/checkout/error`,
            pending: `${baseUrl}/checkout/pending`,
          },
          auto_return: 'approved',
        }
      });
      
      paymentUrl = preference.init_point;
    }

    return NextResponse.json({ 
      ...order,
      total: calculatedTotal,
      paymentUrl 
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Erro ao criar pedido", error: error.message },
      { status: 500 }
    );
  }
}
