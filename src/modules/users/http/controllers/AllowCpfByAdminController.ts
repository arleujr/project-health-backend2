import { FastifyRequest, FastifyReply } from 'fastify';
import { AllowCpfByAdminService } from '../../services/AllowCpfByAdminService.js';

export class AllowCpfByAdminController {
  public async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { cpf } = request.body as { cpf: string };

    const allowCpfByAdminService = new AllowCpfByAdminService();

    await allowCpfByAdminService.execute({ cpf });

    return reply.status(201).send({
      message: 'CPF liberado com sucesso para cadastro!'
    });
  }
}