import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const prisma = new PrismaClient();
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

async function main() {
  console.log("Iniciando sincronização de pedidos pendentes...");

  // Buscar todos os pedidos com status CREATED e que tenham um transaction ID
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: 'CREATED',
      gatewayTransactionId: {
        not: null
      }
    },
    include: { items: true }
  });

  if (pendingOrders.length === 0) {
    console.log("Nenhum pedido pendente com transaction ID encontrado.");
    return;
  }

  console.log(`Encontrados ${pendingOrders.length} pedidos pendentes para verificar.`);
  const paymentClient = new Payment(mpClient);

  for (const order of pendingOrders) {
    if (!order.gatewayTransactionId) continue;
    
    try {
      console.log(`\nVerificando Pedido ${order.orderCode} (Transaction ID: ${order.gatewayTransactionId})...`);
      const payment = await paymentClient.get({ id: order.gatewayTransactionId });

      console.log(`Status no Mercado Pago: ${payment.status}`);

      if (payment.status === 'approved' || payment.status === 'authorized') {
        console.log(`Atualizando pedido ${order.orderCode} para PAID...`);
        
        // 1. Atualizar pedido
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paymentStatus: payment.status,
            gatewayResponse: payment as any,
          }
        });

        // 2. Baixar estoque
        for (const item of order.items) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const newQuantity = Math.max(0, product.stockQuantity - item.quantity);
            await prisma.product.update({
              where: { id: item.productId },
              data: { stockQuantity: newQuantity, inStock: newQuantity > 0 }
            });
            console.log(`Estoque do produto ${product.name} atualizado para ${newQuantity}`);
          }

          if (item.variantId) {
            const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
            if (variant) {
              const newVarQuantity = Math.max(0, variant.stockQuantity - item.quantity);
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stockQuantity: newVarQuantity, active: newVarQuantity > 0 }
              });
            }
          }
        }

        // 3. Atualizar Steps
        const orderSteps = await prisma.orderStep.findMany({ where: { orderId: order.id } });
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
        console.log(`✅ Pedido ${order.orderCode} sincronizado com sucesso!`);
      } else {
        // Atualizar o status do pagamento mesmo se não aprovado
        if (order.paymentStatus !== payment.status) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: payment.status,
                    gatewayResponse: payment as any,
                }
            });
            console.log(`Status de pagamento atualizado para ${payment.status}.`);
        } else {
            console.log(`Nenhuma ação necessária.`);
        }
      }
    } catch (error: any) {
      console.error(`Erro ao verificar pagamento do pedido ${order.orderCode}:`, error.message);
    }
  }

  console.log("\nSincronização concluída.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
