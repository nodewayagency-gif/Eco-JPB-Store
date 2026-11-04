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

    const text = await req.text();
    let body: any = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (e) { }
    }

    const type = queryType || body?.type || (body?.action?.startsWith("payment") ? "payment" : null);
    const dataIdToUse = queryId || body?.data?.id;

    // Verificação Estrita de Assinatura (Segurança Mercado Pago)
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    let webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (process.env.MP_MODE === 'test') {
      webhookSecret = process.env.MP_TEST_WEBHOOK_SECRET || webhookSecret;
    }

    if (webhookSecret) {
      if (!xSignature || !xRequestId) {
        console.warn("⚠️ Webhook Mercado Pago rejeitado: cabeçalhos de assinatura ausentes.");
        return NextResponse.json({ error: "Missing Signature Headers" }, { status: 401 });
      }

      const parts = xSignature.split(",");
      const tsPart = parts.find(p => p.trim().startsWith("ts="));
      const v1Part = parts.find(p => p.trim().startsWith("v1="));

      if (!tsPart || !v1Part) {
        return NextResponse.json({ error: "Malformed Signature Header" }, { status: 400 });
      }

      const ts = tsPart.split("=")[1];
      const v1 = v1Part.split("=")[1];
      const targetId = dataIdToUse || "";

      const manifest = `id:${targetId};request-id:${xRequestId};ts:${ts};`;
      const hmac = crypto.createHmac("sha256", webhookSecret);
      hmac.update(manifest);
      const sha = hmac.digest("hex");

      if (sha !== v1) {
        console.error("❌ Webhook Mercado Pago: Assinatura HMAC inválida! Tentativa de falsificação rejeitada.");
        return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
      }
    }

    console.log(`🔔 Webhook Mercado Pago validado: Type=${type}, ID=${dataIdToUse}`);

    if ((type === "payment" || type === "payment.created" || type === "payment.updated") && dataIdToUse) {
      const client = await getMpClient();
      const paymentClient = new Payment(client);
      
      let payment: any;
      try {
        payment = await paymentClient.get({ id: dataIdToUse.toString() });
      } catch (err: any) {
        console.warn(`⚠️ Pagamento ID=${dataIdToUse} não encontrado no Mercado Pago.`, err.message);
        return NextResponse.json({ message: "OK (Ignorado - Pagamento Inexistente)" }, { status: 200 });
      }

      const orderId = payment.external_reference;
      const status = payment.status;

      console.log(`📦 Pagamento ${dataIdToUse} do Pedido ${orderId}: Status=${status}`);

      if (orderId && (status === "approved" || status === "authorized")) {
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
          select: { status: true, couponCode: true }
        });

        if (currentOrder && currentOrder.status !== "PAID") {
          // 1. Atualizar pedido para pago
          const orderWithItems = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              paymentStatus: status,
              paidAt: new Date(),
              gatewayTransactionId: dataIdToUse.toString(),
              paymentMethodId: payment.payment_method_id,
              installments: payment.installments,
              gatewayResponse: payment as any,
            },
            include: { items: true }
          });

          // 2. Baixar estoque dos itens do pedido com segurança
          if (orderWithItems && orderWithItems.items.length > 0) {
            const updatePromises = orderWithItems.items.map(async (item) => {
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

          // 3. Atualizar etapas da timeline
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

          // 4. Incrementar uso do cupom se existir
          if (currentOrder.couponCode) {
            await prisma.coupon.updateMany({
              where: { code: currentOrder.couponCode },
              data: { usedCount: { increment: 1 } }
            });
          }

          console.log(`✅ Pedido ${orderId}: Pagamento confirmado e estoque atualizado com sucesso.`);
        }
      }
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro no Webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
