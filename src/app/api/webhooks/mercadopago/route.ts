import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMpClient } from "@/lib/mercadopago";
import { Payment } from "mercadopago";

import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryType = searchParams.get("type") || searchParams.get("topic");
    const queryId = searchParams.get("data.id") || searchParams.get("id");

    // Verificação de Assinatura (Segurança Mercado Pago)
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    let webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (process.env.MP_MODE === 'test') {
      webhookSecret = process.env.MP_TEST_WEBHOOK_SECRET || webhookSecret;
    }

    if (xSignature && xRequestId && webhookSecret && queryId) {
      const parts = xSignature.split(",");
      const tsPart = parts.find(p => p.trim().startsWith("ts="));
      const v1Part = parts.find(p => p.trim().startsWith("v1="));

      if (tsPart && v1Part) {
        const ts = tsPart.split("=")[1];
        const v1 = v1Part.split("=")[1];

        const manifest = `id:${queryId};request-id:${xRequestId};ts:${ts};`;
        const hmac = crypto.createHmac("sha256", webhookSecret);
        hmac.update(manifest);
        const sha = hmac.digest("hex");

        if (sha !== v1) {
          console.error("❌ Webhook: Assinatura inválida! Possível tentativa de fraude.");
          return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
        }
      }
    }

    const text = await req.text();
    let body: any = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (e) { }
    }

    const type = queryType || body?.type || (body?.action?.startsWith("payment") ? "payment" : null);
    const dataIdToUse = queryId || body?.data?.id;

    console.log(`🔔 Webhook Mercado Pago recebido: Type=${type}, ID=${dataIdToUse}`);

    if ((type === "payment" || type === "payment.created" || type === "payment.updated") && dataIdToUse) {
      const client = await getMpClient();
      const paymentClient = new Payment(client);
      
      let payment: any;
      try {
        payment = await paymentClient.get({ id: dataIdToUse.toString() });
      } catch (err: any) {
        console.warn(`⚠️ Pagamento ID=${dataIdToUse} não encontrado no Mercado Pago. Possível simulação de teste.`, err.message);
        // Retornar 200 para o painel do MP entender que recebemos, senão o "Simular Notificação" dá 502/500
        return NextResponse.json({ message: "OK (Ignorado - Pagamento Inexistente)" }, { status: 200 });
      }

      const orderId = payment.external_reference;
      const status = payment.status;

      console.log(`📦 Pagamento ${dataIdToUse} do Pedido ${orderId}: Status=${status}`);

      if (orderId && (status === "approved" || status === "authorized")) {
        // Verificar o status atual do pedido para evitar reprocessamento e múltiplos decrementos de estoque
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: { status: true }
        });

        if (currentOrder && currentOrder.status !== "PAID") {
          // 1. Atualizar pedido para pago e incluir items na mesma query
          const orderWithItems = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              paymentStatus: status,
              gatewayTransactionId: dataIdToUse.toString(),
              paymentMethodId: payment.payment_method_id,
              installments: payment.installments,
              gatewayResponse: payment as any,
            },
            include: { items: true }
          });

          // 2. Baixar estoque dos itens do pedido (concorrente)
          if (orderWithItems && orderWithItems.items.length > 0) {
            const updatePromises = orderWithItems.items.map(async (item) => {
              // Decrementar estoque do produto principal
              const product = await prisma.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity } }
              });
              if (product && product.stockQuantity <= 0) {
                await prisma.product.update({
                  where: { id: item.productId },
                  data: { inStock: false }
                });
              }

              // Se o item tiver variante, decrementar estoque da variante
              if (item.variantId) {
                const variant = await prisma.productVariant.update({
                  where: { id: item.variantId },
                  data: { stockQuantity: { decrement: item.quantity } }
                });
                if (variant && variant.stockQuantity <= 0) {
                  await prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: { active: false }
                  });
                }
              }
            });
            await Promise.all(updatePromises);
          }

          // 3. Atualizar os passos do pedido (Timeline) concorrentemente
          await Promise.all([
            prisma.orderStep.updateMany({
              where: {
                orderId: orderId,
                key: { in: ['waiting_payment', 'paid'] }
              },
              data: {
                completed: true,
                active: false
              }
            }),
            prisma.orderStep.updateMany({
              where: {
                orderId: orderId,
                key: 'in_separation'
              },
              data: {
                active: true
              }
            })
          ]);

          console.log(`✅ Pedido ${orderId}: Pagamento confirmado e ESTOQUE ATUALIZADO.`);
        } else {
          console.log(`ℹ️ Pedido ${orderId} já está marcado como pago (PAID). Ignorando atualização de estoque.`);
        }
      }
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro no Webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
