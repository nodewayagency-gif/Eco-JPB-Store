import { FastifyReply, FastifyRequest } from 'fastify';
import { ListCategoriesUseCase } from '../../application/use-cases/ListCategoriesUseCase';
import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '../../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/DeleteCategoryUseCase';

export class CategoryController {
  private listCategoriesUseCase: ListCategoriesUseCase;
  private createCategoryUseCase: CreateCategoryUseCase;
  private updateCategoryUseCase: UpdateCategoryUseCase;
  private deleteCategoryUseCase: DeleteCategoryUseCase;

  constructor() {
    this.listCategoriesUseCase = new ListCategoriesUseCase();
    this.createCategoryUseCase = new CreateCategoryUseCase();
    this.updateCategoryUseCase = new UpdateCategoryUseCase();
    this.deleteCategoryUseCase = new DeleteCategoryUseCase();
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await this.listCategoriesUseCase.execute();
      return reply.send(categories);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao buscar categorias', error });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const category = await this.createCategoryUseCase.execute(data);
      return reply.status(201).send(category);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao criar categoria', error });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const data = request.body as any;
      const category = await this.updateCategoryUseCase.execute(id, data);
      return reply.send(category);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao atualizar categoria', error });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await this.deleteCategoryUseCase.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao deletar categoria', error });
    }
  }
}
