import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpClient } from "@/lib/mercadopago";
import { Payment } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: "ID do pedido é obrigatório" }, { status: 400 });
    }

    // 1. Buscar o pedido para garantir o valor correto
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
    }

    // 2. Processar o pagamento no Mercado Pago
    const payment = new Payment(mpClient);

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: Number(order.total),
        token: formData.token,
        description: `Pedido ${order.orderCode} - JPB Store`,
        installments: Number(formData.installments),
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: formData.payer.email,
          identification: {
            type: formData.payer.identification.type,
            number: formData.payer.identification.number,
          },
        },
        external_reference: order.id,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      },
    });

    // 3. Atualizar o pedido com o status do pagamento e detalhes
    const mpStatus = paymentResponse.status;
    const mpId = paymentResponse.id;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: mpStatus === 'approved' ? "PAID" : "CREATED",
        paymentStatus: mpStatus,
        gatewayTransactionId: mpId?.toString(),
        paymentMethodId: paymentResponse.payment_method_id,
        installments: paymentResponse.installments,
        gatewayResponse: paymentResponse as any, // Guardar resposta completa
      }
    });

    return NextResponse.json({
      status: mpStatus,
      id: mpId,
      detail: paymentResponse.status_detail,
      qr_code: (paymentResponse as any).point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: (paymentResponse as any).point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: (paymentResponse as any).point_of_interaction?.transaction_data?.ticket_url,
    });

  } catch (error: any) {
    console.error("❌ Erro ao processar pagamento transparente:", error);
    return NextResponse.json({ 
      message: "Erro ao processar pagamento", 
      error: error.cause?.[0]?.description || error.message 
    }, { status: 500 });
  }
}
