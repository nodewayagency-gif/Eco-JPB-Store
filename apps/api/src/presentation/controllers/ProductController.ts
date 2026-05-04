import { FastifyReply, FastifyRequest } from 'fastify';
import { ListProductsUseCase } from '../../application/use-cases/ListProductsUseCase';
import { GetProductUseCase } from '../../application/use-cases/GetProductUseCase';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/DeleteProductUseCase';

export class ProductController {
  private listProductsUseCase: ListProductsUseCase;
  private getProductUseCase: GetProductUseCase;
  private createProductUseCase: CreateProductUseCase;
  private updateProductUseCase: UpdateProductUseCase;
  private deleteProductUseCase: DeleteProductUseCase;

  constructor() {
    this.listProductsUseCase = new ListProductsUseCase();
    this.getProductUseCase = new GetProductUseCase();
    this.createProductUseCase = new CreateProductUseCase();
    this.updateProductUseCase = new UpdateProductUseCase();
    this.deleteProductUseCase = new DeleteProductUseCase();
  }

  async list(request: FastifyRequest<{ Querystring: { active?: string } }>, reply: FastifyReply) {
    try {
      const onlyActive = request.query.active === 'true';
      const products = await this.listProductsUseCase.execute(onlyActive);
      return reply.send(products);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao listar produtos', error });
    }
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const product = await this.getProductUseCase.execute(id);

      if (!product) {
        return reply.status(404).send({ message: 'Produto não encontrado' });
      }

      return reply.send(product);
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao buscar produto', error });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const product = await this.createProductUseCase.execute(data);
      return reply.status(201).send(product);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Erro ao criar produto', error });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    console.log('>>> RECEBENDO ATUALIZAÇÃO DE PRODUTO:', request.params.id);
    try {
      const { id } = request.params;
      const data = request.body as any;
      console.log('>>> DADOS RECEBIDOS:', JSON.stringify(data));
      const product = await this.updateProductUseCase.execute(id, data);
      return reply.send(product);
    } catch (error: any) {
      console.error('>>> ERRO FATAL NO UPDATE:', error.message, error.stack);
      return reply.status(500).send({ message: 'Erro ao atualizar produto', error: error.message });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await this.deleteProductUseCase.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ message: 'Erro ao deletar produto', error });
    }
  }
}
