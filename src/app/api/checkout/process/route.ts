import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMpClient } from "@/lib/mercadopago";
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
      include: { 
        customer: {
          include: { customerProfile: true }
        } 
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
    }

    // 2. Processar o pagamento no Mercado Pago
    const client = await getMpClient();
    const payment = new Payment(client);
    
    const doc = order.guestDocument || order.customer?.customerProfile?.document || '';

    const paymentBody: any = {
      transaction_amount: Number(Number(order.total).toFixed(2)),
      description: `Pedido ${order.orderCode} - JPB Store`,
      installments: Number(formData.installments) || 1,
      payment_method_id: formData.payment_method_id,
      payer: {
        email: (formData.payer?.email || order.guestEmail || order.customer?.email || '').trim() || 'cliente@dominio.com',
        first_name: formData.payer?.first_name || (order.guestName || order.customer?.customerProfile?.name || '').split(' ')[0] || 'Cliente',
        last_name: formData.payer?.last_name || (order.guestName || order.customer?.customerProfile?.name || '').split(' ').slice(1).join(' ') || undefined,
      },
      external_reference: order.id,
    };

    const docNumber = formData.payer?.identification?.number || doc.replace(/\D/g, '');
    if (docNumber) {
      paymentBody.payer.identification = {
        type: formData.payer?.identification?.type || (docNumber.length > 14 ? 'CNPJ' : 'CPF'),
        number: docNumber,
      };
    }

    if (formData.token) paymentBody.token = formData.token;
    if (formData.issuer_id) paymentBody.issuer_id = formData.issuer_id;
    if (formData.payer?.entity_type) paymentBody.payer.entity_type = formData.payer.entity_type;
    
    if (process.env.NEXT_PUBLIC_APP_URL) {
      paymentBody.notification_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`;
    }

    // Remover propriedades vazias, undefined ou null do payer para evitar erro 400 no Mercado Pago
    Object.keys(paymentBody.payer).forEach(key => {
      const val = paymentBody.payer[key];
      if (val === undefined || val === null || val === '') {
        delete paymentBody.payer[key];
      }
    });

    const paymentResponse = await payment.create({
      body: paymentBody,
    });

    // 3. Atualizar o pedido com o status do pagamento e detalhes
    const mpStatus = paymentResponse.status;
    const mpId = paymentResponse.id;
    const isApproved = mpStatus === 'approved';

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: isApproved ? "PAID" : "CREATED",
        paidAt: isApproved ? new Date() : undefined,
        paymentStatus: mpStatus,
        gatewayTransactionId: mpId?.toString(),
        paymentMethodId: paymentResponse.payment_method_id,
        installments: paymentResponse.installments,
        gatewayResponse: paymentResponse as any,
      },
      include: { items: true }
    });

    // Se o pagamento já foi aprovado imediatamente (ex: cartão sem análise manual)
    if (isApproved && updatedOrder.items && updatedOrder.items.length > 0) {
      const updatePromises = updatedOrder.items.map(async (item) => {
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

      // Atualiza etapas da timeline
      await Promise.all([
        prisma.orderStep.updateMany({
          where: {
            orderId: order.id,
            key: { in: ['waiting_payment', 'paid'] }
          },
          data: { completed: true, active: false }
        }),
        prisma.orderStep.updateMany({
          where: { orderId: order.id, key: 'in_separation' },
          data: { active: true }
        })
      ]);

      // Incrementar cupom se houver
      if (order.couponCode) {
        await prisma.coupon.updateMany({
          where: { code: order.couponCode },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    return NextResponse.json({
      status: mpStatus,
      id: mpId,
      detail: paymentResponse.status_detail,
      qr_code: (paymentResponse as any).point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: (paymentResponse as any).point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: (paymentResponse as any).point_of_interaction?.transaction_data?.ticket_url,
    });

  } catch (error: any) {
    console.error("❌ Erro detalhado no pagamento:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      message: "Erro ao processar pagamento", 
      error: error.message,
      details: error.cause?.[0]?.description || "Ocorreu um erro interno ao processar com o Mercado Pago."
    }, { status: 500 });
  }
}
