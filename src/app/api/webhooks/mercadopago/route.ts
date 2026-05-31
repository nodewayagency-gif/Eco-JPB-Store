import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMpClient } from "@/lib/mercadopago";
import { decrypt } from "@/lib/encryption";
import { Payment } from "mercadopago";

import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryType = searchParams.get("type") || searchParams.get("topic");
    const queryId = searchParams.get("data.id") || searchParams.get("id");

    const config = await prisma.companyConfig.findFirst();

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
          return new NextResponse("Invalid Signature", { status: 403 });
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
      const payment = await paymentClient.get({ id: dataIdToUse.toString() });

      const orderId = payment.external_reference;
      const status = payment.status;

      console.log(`📦 Pagamento ${dataIdToUse} do Pedido ${orderId}: Status=${status}`);

      if (orderId && (status === "approved" || status === "authorized")) {
        // 1. Atualizar pedido para pago
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentStatus: status,
            gatewayTransactionId: dataIdToUse.toString(),
            paymentMethodId: payment.payment_method_id,
            installments: payment.installments,
            gatewayResponse: payment as any,
          }
        });

        // 2. Baixar estoque dos itens do pedido
        const orderWithItems = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        });

        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            // Decrementar estoque do produto principal
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (product) {
              const newQuantity = Math.max(0, product.stockQuantity - item.quantity);
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: newQuantity,
                  inStock: newQuantity > 0
                }
              });
            }

            // Se o item tiver variante, decrementar estoque da variante também
            if (item.variantId) {
              const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
              if (variant) {
                const newVarQuantity = Math.max(0, variant.stockQuantity - item.quantity);
                await prisma.productVariant.update({
                  where: { id: item.variantId },
                  data: {
                    stockQuantity: newVarQuantity,
                    active: newVarQuantity > 0
                  }
                });
              }
            }
          }
        }

        // 3. Atualizar os passos do pedido (Timeline)
        const orderSteps = await prisma.orderStep.findMany({
          where: { orderId: orderId }
        });

        const waitingPaymentStep = orderSteps.find(s => s.key === 'waiting_payment');
        const paidStep = orderSteps.find(s => s.key === 'paid');
        const nextStep = orderSteps.find(s => s.key === 'in_separation');

        if (waitingPaymentStep) {
          await prisma.orderStep.update({
            where: { id: waitingPaymentStep.id },
            data: { completed: true, active: false }
          });
        }

        if (paidStep && nextStep) {
          await prisma.orderStep.update({
            where: { id: paidStep.id },
            data: { completed: true, active: false }
          });
          await prisma.orderStep.update({
            where: { id: nextStep.id },
            data: { active: true }
          });
        }

        console.log(`✅ Pedido ${orderId}: Pagamento confirmado e ESTOQUE ATUALIZADO.`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro no Webhook Mercado Pago:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
