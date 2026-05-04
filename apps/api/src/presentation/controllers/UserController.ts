import { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase';
import { UpdateUserPasswordUseCase } from '../../application/use-cases/UpdateUserPasswordUseCase';

export class UserController {
  private listUsersUseCase = new ListUsersUseCase();
  private updatePasswordUseCase = new UpdateUserPasswordUseCase();

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.listUsersUseCase.execute();
      return reply.send(users);
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }

  async updatePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { password } = request.body as { password: string };

    try {
      if (!password || password.length < 4) {
        return reply.status(400).send({ message: "A senha deve ter pelo menos 4 caracteres" });
      }

      await this.updatePasswordUseCase.execute(id, password);
      return reply.send({ message: "Senha atualizada com sucesso" });
    } catch (error: any) {
      return reply.status(500).send({ message: error.message });
    }
  }
}
