import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpClient } from "@/lib/mercadopago";
import { Payment } from "mercadopago";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const dataId = searchParams.get("data.id");

    console.log(`🔔 Webhook Mercado Pago recebido: Type=${type}, ID=${dataId}`);

    if (type === "payment" && dataId) {
      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: dataId });

      const orderId = payment.external_reference;
      const status = payment.status;

      console.log(`📦 Pagamento ${dataId} do Pedido ${orderId}: Status=${status}`);

      if (orderId && (status === "approved" || status === "authorized")) {
        // 1. Atualizar pedido para pago
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentStatus: status,
            gatewayTransactionId: dataId.toString(),
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
        
        const paidStep = orderSteps.find(s => s.key === 'paid');
        const nextStep = orderSteps.find(s => s.key === 'in_separation');
        
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
