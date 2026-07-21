import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando pedidos pagos para definir paidAt = createdAt...');
  const result = await prisma.order.updateMany({
    where: {
      status: 'PAID',
      paidAt: null
    },
    data: {
      // Usar a mesma variável é um pouco trick no updateMany dependendo do driver
      // Em SQLite e MySQL é possivel, mas no prisma às vezes nao dá direto.
      // Vou buscar os orders e atualizar um por um para garantir.
    }
  });

  const orders = await prisma.order.findMany({
    where: { status: 'PAID', paidAt: null },
    select: { id: true, createdAt: true }
  });

  let count = 0;
  for (const o of orders) {
    await prisma.order.update({
      where: { id: o.id },
      data: { paidAt: o.createdAt }
    });
    count++;
  }
  
  console.log(`✅ Atualizados ${count} pedidos com paidAt retroativo.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
