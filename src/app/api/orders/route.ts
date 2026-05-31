import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { getMpPreference } from "@/lib/mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, total, shippingAddress, paymentMethod, guestName, guestEmail, guestPhone, guestDocument } = body;

    const authUser = await getAuthUser();

    // 1. Buscar produtos no banco para validar preços e pegar nomes (Segurança)
    const productIds = items.map((item: any) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Validar se todos os produtos existem
    if (dbProducts.length !== items.length) {
      return NextResponse.json({ message: "Um ou mais produtos não foram encontrados" }, { status: 400 });
    }

    // Gerar código do pedido único
    const orderCode = `JPB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 2. Criar o pedido no banco de dados
    const order = await prisma.order.create({
      data: {
        orderCode,
        customerId: authUser?.sub || null,
        guestName: !authUser ? guestName : null,
        guestEmail: !authUser ? guestEmail : null,
        guestPhone: !authUser ? guestPhone : null,
        guestDocument: !authUser ? guestDocument : null,
        total,
        status: "CREATED",
        paymentGateway: paymentMethod,
        shippingAddress: shippingAddress as any,
        items: {
          create: items.map((item: any) => {
            const product = dbProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product?.price || item.unitPrice,
            };
          }),
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
      const preference = await mpPreference.create({
        body: {
          items: items.map((item: any) => {
            const product = dbProducts.find(p => p.id === item.productId);
            return {
              id: item.productId,
              title: product?.name || "Produto JPB Store",
              quantity: item.quantity,
              unit_price: Number(product?.price || item.unitPrice),
              currency_id: 'BRL',
            };
          }),
          external_reference: order.id,
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/api/webhooks/mercadopago`,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/checkout/success?orderId=${order.id}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/checkout/error`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/checkout/pending`,
          },
          auto_return: 'approved',
        }
      });
      
      paymentUrl = preference.init_point;
    }

    return NextResponse.json({ 
      ...order,
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
