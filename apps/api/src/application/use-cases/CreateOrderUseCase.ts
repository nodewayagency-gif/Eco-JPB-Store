import { prisma } from '../../infrastructure/database/prisma';

interface CreateOrderDTO {
  userId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  paymentMethod: string;
  shippingAddress: any;
}

export class CreateOrderUseCase {
  async execute(data: CreateOrderDTO) {
    const { userId, items, total, paymentMethod, shippingAddress } = data;

    // Gerar código do pedido (ex: JPB-20240502-ABCD)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(7).toUpperCase();
    const orderCode = `JPB-${dateStr}-${randomStr}`;

    return await prisma.$transaction(async (tx) => {
      // 1. Validar se todos os produtos existem
      const productIds = items.map(i => i.productId);
      const productsCount = await tx.product.count({
        where: { id: { in: productIds } }
      });

      if (productsCount !== productIds.length) {
        throw new Error("Um ou mais produtos no seu carrinho não existem mais. Por favor, limpe o carrinho e tente novamente.");
      }

      // 2. Criar o Pedido
      const order = await tx.order.create({
        data: {
          orderCode,
          customerId: userId,
          status: 'CREATED',
          total,
          paymentGateway: paymentMethod,
          shippingCarrier: "Aguardando", 
          shippingAddress: shippingAddress,
          channel: "Loja Virtual",
        }
      });

      // 3. Criar os Itens do Pedido
      const orderItems = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await tx.orderItem.createMany({
        data: orderItems
      });

      // 4. Criar a primeira etapa (Step) do pedido para a gestão
      await tx.orderStep.create({
        data: {
          orderId: order.id,
          key: 'created',
          label: 'Pedido criado',
          completed: true,
          active: true,
          source: 'system',
          updatedAt: new Date()
        }
      });

      // 5. Limpar o Carrinho do usuário (se existir)
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cart.update({
          where: { userId },
          data: {
            items: {
              deleteMany: {}
            }
          }
        });
      }

      return order;
    });
  }
}
