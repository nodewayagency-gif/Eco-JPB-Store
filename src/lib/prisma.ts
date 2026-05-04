import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
    ],
  });

if (typeof window === 'undefined') {
  (prisma as any).$on('query', (e: any) => {
    if (e.duration > 150) {
      console.log(`🐢 Slow Query (${e.duration}ms): ${e.query.substring(0, 100)}...`);
    }
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
