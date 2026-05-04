import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';

export class AuthController {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;

  constructor() {
    this.loginUseCase = new LoginUseCase();
    this.registerUseCase = new RegisterUseCase();
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as any;
      const user = await this.loginUseCase.execute({ email, password });

      // Gerar o Token JWT
      const token = await reply.jwtSign({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      return reply.send({
        user: {
          id: user.id,
          displayName: (user as any).customerProfile?.name || user.name || '',
          email: user.email,
          role: user.role,
          image: user.image,
          status: (user as any).status || 'ACTIVE'
        },
        token,
      });
    } catch (error: any) {
      return reply.status(401).send({ message: error.message });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await this.registerUseCase.execute(request.body);

      // Gerar o Token JWT
      const token = await reply.jwtSign({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          displayName: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          status: 'ACTIVE'
        },
        token,
      });
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  }
}
