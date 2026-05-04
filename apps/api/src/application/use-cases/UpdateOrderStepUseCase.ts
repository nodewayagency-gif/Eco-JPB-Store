import { prisma } from '../../infrastructure/database/prisma';

interface UpdateOrderStepInput {
  orderId: string;
  stepKey: string;
  source?: 'system' | 'manual';
}

export class UpdateOrderStepUseCase {
  private stepOrder = [
    "created",
    "payment_confirmed",
    "in_separation",
    "ready_to_ship",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  async execute({ orderId, stepKey, source = 'manual' }: UpdateOrderStepInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { steps: true }
    });

    if (!order) throw new Error("Pedido não encontrado");

    const targetIndex = this.stepOrder.indexOf(stepKey);
    if (targetIndex === -1) throw new Error("Etapa inválida");

    // Atualizar todas as etapas
    await prisma.$transaction(
      this.stepOrder.map((key, index) => {
        const completed = index < targetIndex;
        const active = index === targetIndex;
        
        return prisma.orderStep.upsert({
          where: { 
            id: order.steps.find(s => s.key === key)?.id || 'new_id'
          },
          create: {
            orderId,
            key,
            label: this.getLabel(key),
            completed,
            active,
            source: active ? source : 'system',
            updatedAt: new Date()
          },
          update: {
            completed,
            active,
            source: active ? source : undefined,
            updatedAt: active ? new Date() : undefined
          }
        });
      })
    );

    // Também atualizar o status principal do Order se necessário
    const statusMap: Record<string, any> = {
      "created": "CREATED",
      "payment_confirmed": "PAID",
      "shipped": "SHIPPED",
      "delivered": "DELIVERED"
    };

    if (statusMap[stepKey]) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: statusMap[stepKey] }
      });
    }

    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        steps: { orderBy: { updatedAt: 'asc' } },
        items: { include: { product: true } },
        customer: { include: { customerProfile: true } }
      }
    });
  }

  private getLabel(key: string): string {
    const labels: Record<string, string> = {
      created: "Pedido criado",
      payment_confirmed: "Pagamento confirmado",
      in_separation: "Em separação",
      ready_to_ship: "Pronto para envio",
      shipped: "Enviado",
      out_for_delivery: "Saiu para entrega",
      delivered: "Entregue"
    };
    return labels[key] || key;
  }
}
