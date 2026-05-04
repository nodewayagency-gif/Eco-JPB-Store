import Fastify from 'fastify';
// Forcing restart to activate support debug logs - 2026-05-02 20:03
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { productRoutes } from './presentation/routes/productRoutes';
import { categoryRoutes } from './presentation/routes/categoryRoutes';
import { authRoutes } from './presentation/routes/authRoutes';
import { couponRoutes } from './presentation/routes/couponRoutes';
import { customerRoutes } from './presentation/routes/customerRoutes';
import { orderRoutes } from './presentation/routes/orderRoutes';
import { supportRoutes } from './presentation/routes/supportRoutes';
import { userRoutes } from './presentation/routes/userRoutes';
import { configRoutes } from './presentation/routes/configRoutes';

const app = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB
});

async function bootstrap() {
  await app.register(cors, {
    origin: '*', // Em produção, mude para a URL do seu frontend
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'premium-electronics-secret-key-2024',
  });

  // Registrar rotas com prefixo /api
  await app.register(productRoutes, { prefix: '/api' });
  await app.register(categoryRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(couponRoutes, { prefix: '/api' });
  await app.register(customerRoutes, { prefix: '/api' });
  await app.register(orderRoutes, { prefix: '/api' });
  await app.register(supportRoutes, { prefix: '/api' });
  await app.register(userRoutes, { prefix: '/api' });
  await app.register(configRoutes, { prefix: '/api' });

  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Backend rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
