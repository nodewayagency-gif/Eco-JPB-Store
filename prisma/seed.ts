import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando semeadura do banco de dados...');

  // 1. O script de seed agora apenas adiciona dados. Comandos de limpeza foram removidos por segurança.

  // 2. Criar Categorias
  const catHeadphones = await prisma.category.create({
    data: {
      name: 'Fones de Ouvido',
      slug: 'headphones',
      description: 'Fones de ouvido premium com cancelamento de ruído.',
      image: '/categories/headphones.png',
    },
  });

  const catEarbuds = await prisma.category.create({
    data: {
      name: 'Earbuds',
      slug: 'earbuds',
      description: 'Fones intra-auriculares totalmente sem fio.',
      image: '/categories/earbuds.png',
    },
  });

  const catSpeakers = await prisma.category.create({
    data: {
      name: 'Caixas de Som',
      slug: 'speakers',
      description: 'Som potente e cristalino para qualquer ambiente.',
      image: '/categories/speakers.png',
    },
  });

  const catWatches = await prisma.category.create({
    data: {
      name: 'Smartwatches',
      slug: 'smartwatches',
      description: 'Tecnologia e estilo no seu pulso.',
      image: '/categories/smartwatch.png',
    },
  });

  console.log('✅ Categorias criadas.');

  // 3. Criar Produtos
  await prisma.product.create({
    data: {
      name: 'JPB Studio Pro Max',
      slug: 'jpb-studio-pro-max',
      sku: 'JPB-HDP-001',
      description: 'O ápice do áudio premium. Com cancelamento de ruído ativo de última geração e 38 horas de bateria.',
      price: 1899.00,
      originalPrice: 2199.00,
      image: 'hero-headphones',
      categoryId: catHeadphones.id,
      stockQuantity: 50,
      costPrice: 850.00,
      weightKg: 0.350,
      lengthCm: 20,
      widthCm: 18,
      heightCm: 8,
      originZipCode: '01001-000',
      rating: 4.9,
      reviewCount: 128,
    },
  });

  await prisma.product.create({
    data: {
      name: 'JPB Air Buds',
      slug: 'jpb-air-buds',
      sku: 'JPB-ERB-001',
      description: 'Som cristalino em um design ultra-compacto. Resistente à água e suor.',
      price: 899.00,
      image: 'product-earbuds',
      categoryId: catEarbuds.id,
      stockQuantity: 100,
      costPrice: 320.00,
      weightKg: 0.050,
      lengthCm: 6,
      widthCm: 5,
      heightCm: 3,
      originZipCode: '01001-000',
      rating: 4.8,
      reviewCount: 245,
    },
  });

  await prisma.product.create({
    data: {
      name: 'JPB Go Sound',
      slug: 'jpb-go-sound',
      sku: 'JPB-SPK-001',
      description: 'A caixa de som portátil definitiva. Som 360 graus e totalmente à prova d\'água.',
      price: 549.00,
      image: 'product-speaker',
      categoryId: catSpeakers.id,
      stockQuantity: 75,
      costPrice: 180.00,
      weightKg: 0.800,
      lengthCm: 15,
      widthCm: 10,
      heightCm: 10,
      originZipCode: '01001-000',
      rating: 4.7,
      reviewCount: 89,
    },
  });

  await prisma.product.create({
    data: {
      name: 'JPB Watch Ultra',
      slug: 'jpb-watch-ultra',
      sku: 'JPB-WTC-001',
      description: 'O smartwatch para quem não para. Tela AMOLED e sensores de saúde avançados.',
      price: 1299.00,
      image: 'product-watch',
      categoryId: catWatches.id,
      stockQuantity: 40,
      costPrice: 550.00,
      weightKg: 0.080,
      lengthCm: 5,
      widthCm: 4,
      heightCm: 1,
      originZipCode: '01001-000',
      rating: 4.9,
      reviewCount: 67,
    },
  });

  console.log('✅ Produtos criados.');

  // 4. Criar Pedidos de Exemplo
  const order1 = await prisma.order.create({
    data: {
      orderCode: `JPB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-S1`,
      guestName: 'Junior Maiente',
      guestEmail: 'maiante@outlook.com',
      total: 1899.00,
      status: 'PAID',
      paymentGateway: 'Mercado Pago',
      shippingCarrier: 'Melhor Envio',
      channel: 'Loja Virtual',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'jpb-studio-pro-max' } }))!.id,
            quantity: 1,
            unitPrice: 1899.00
          }
        ]
      },
      steps: {
        create: [
          { key: 'created', label: 'Pedido criado', completed: true, active: false, source: 'system' },
          { key: 'payment_confirmed', label: 'Pagamento confirmado', completed: true, active: true, source: 'system' },
          { key: 'in_separation', label: 'Em separação', completed: false, active: false, source: 'system' },
          { key: 'ready_to_ship', label: 'Pronto para envio', completed: false, active: false, source: 'system' },
          { key: 'shipped', label: 'Enviado', completed: false, active: false, source: 'system' },
          { key: 'out_for_delivery', label: 'Saiu para entrega', completed: false, active: false, source: 'system' },
          { key: 'delivered', label: 'Entregue', completed: false, active: false, source: 'system' }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderCode: `JPB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-S2`,
      guestName: 'Ana Silva',
      guestEmail: 'ana@example.com',
      total: 549.00,
      status: 'CREATED',
      channel: 'Venda externa',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'jpb-go-sound' } }))!.id,
            quantity: 1,
            unitPrice: 549.00
          }
        ]
      },
      steps: {
        create: [
          { key: 'created', label: 'Pedido criado', completed: true, active: true, source: 'manual' },
          { key: 'payment_confirmed', label: 'Pagamento confirmado', completed: false, active: false, source: 'system' },
          { key: 'in_separation', label: 'Em separação', completed: false, active: false, source: 'system' },
          { key: 'ready_to_ship', label: 'Pronto para envio', completed: false, active: false, source: 'system' },
          { key: 'shipped', label: 'Enviado', completed: false, active: false, source: 'system' },
          { key: 'out_for_delivery', label: 'Saiu para entrega', completed: false, active: false, source: 'system' },
          { key: 'delivered', label: 'Entregue', completed: false, active: false, source: 'system' }
        ]
      }
    }
  });

  console.log('✅ Pedidos de exemplo criados.');

  // 5. Criar Chamados de Suporte de Exemplo
  await prisma.supportTicket.create({
    data: {
      customerId: (await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }))?.id || 'admin_id_fallback',
      customerName: 'Junior Maiente',
      customerEmail: 'maiante@outlook.com',
      subject: 'Dúvida sobre o JPB Studio Pro Max',
      description: 'Gostaria de saber se a bateria realmente dura 38 horas em uso contínuo.',
      status: 'OPEN',
      messages: {
        create: [
          {
            senderId: 'customer_id',
            senderName: 'Junior Maiente',
            senderRole: 'CUSTOMER',
            content: 'Gostaria de saber se a bateria realmente dura 38 horas em uso contínuo.'
          }
        ]
      }
    }
  });

  console.log('✅ Chamados de suporte criados.');
  console.log('✨ Semeadura finalizada com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
