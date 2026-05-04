import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'maiante@outlook.com'; // O e-mail que vi no print (corrigindo o typo de malante para maiante se necessário)
  console.log(`Verificando dados para o e-mail: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      customerProfile: {
        include: {
          addresses: true
        }
      }
    }
  });

  if (!user) {
    // Tentar com o typo do print caso seja esse mesmo
    const userTypo = await prisma.user.findUnique({
      where: { email: 'malante@outlook.com' },
      include: {
        customerProfile: {
          include: {
            addresses: true
          }
        }
      }
    });
    
    if (userTypo) {
      console.log('Usuário encontrado (com typo):', JSON.stringify(userTypo, null, 2));
    } else {
      console.log('Usuário não encontrado no banco.');
    }
  } else {
    console.log('Usuário encontrado:', JSON.stringify(user, null, 2));
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
