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
        // Atualizar pedido para pago com detalhes
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentStatus: status,
            gatewayTransactionId: dataId.toString(),
            paymentMethodId: payment.payment_method_id,
            installments: payment.installments,
            gatewayResponse: payment as any,
            steps: {
              updateMany: {
                where: { key: "paid" },
                data: { completed: true, active: false }
              },
              // Ativar o próximo passo
              update: {
                where: { id: "in_separation" }, // Isso pode variar se o ID for fixo ou não
                data: { active: true }
              }
            }
          }
        });
        
        // Como o ID do step 'in_separation' não é fixo (cuid), precisamos de uma lógica melhor
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

        console.log(`✅ Pedido ${orderId} marcado como PAGO.`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("❌ Erro no Webhook Mercado Pago:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
