import { prisma } from '../../infrastructure/database/prisma';

export class GetCustomerOrdersUseCase {
  async execute(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId: userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Mapear para o formato que o frontend espera (CustomerOrderView)
    return orders.map(order => ({
      id: order.orderCode,
      product: order.items.length > 0 
        ? (order.items.length > 1 
            ? `${order.items[0].product.name} + ${order.items.length - 1} itens` 
            : order.items[0].product.name)
        : "Pedido sem itens",
      date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
      status: this.mapStatus(order.status),
      total: Number(order.total),
      tracking: [
        {
          title: "Pedido Realizado",
          description: "Recebemos o seu pedido com sucesso.",
          date: new Date(order.createdAt).toLocaleString('pt-BR'),
          completed: true,
          active: order.status === 'CREATED'
        },
        // Adicionar outros passos fictícios por enquanto se não houver rastreio real
        {
          title: "Pagamento Confirmado",
          description: "Seu pagamento foi aprovado pelo gateway.",
          date: "-",
          completed: order.status !== 'CREATED' && order.status !== 'CANCELED',
          active: order.status === 'PAID'
        }
      ]
    }));
  }

  private mapStatus(status: string) {
    const map: Record<string, string> = {
      'CREATED': 'Processando',
      'PAID': 'Processando',
      'SHIPPED': 'Em Trânsito',
      'DELIVERED': 'Entregue',
      'CANCELED': 'Cancelado'
    };
    return map[status] || 'Processando';
  }
}
