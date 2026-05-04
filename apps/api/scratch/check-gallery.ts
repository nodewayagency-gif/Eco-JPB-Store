import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true, images: true }
  });
  
  console.log('--- CONTEÚDO DAS IMAGENS ---');
  products.forEach(p => {
    console.log(`Produto: ${p.name}`);
    console.log(`- Principal: ${p.image ? 'Sim (URL)' : 'Não'}`);
    console.log(`- Galeria: ${p.images.length} fotos`);
    if (p.images.length > 0) {
        console.log(`  URLs: ${p.images.join(', ')}`);
    }
    console.log('---------------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
