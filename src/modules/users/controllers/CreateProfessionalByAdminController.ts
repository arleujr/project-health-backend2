import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateProfessionalByAdminService } from '../services/CreateProfessionalByAdminService.js';

export class CreateProfessionalByAdminController {
  public async handle(request: FastifyRequest, reply: FastifyReply) {
    // 🔑 SEGURANÇA MÁXIMA: Pega a role de quem está logado fazendo a requisição
    const requesterRole = (request.user as any)?.role;

    if (requesterRole !== 'ADMIN') {
      return reply.status(403).send({
        status: 'error',
        message: 'Acesso negado. Apenas administradores do sistema podem cadastrar profissionais.'
      });
    }

    const { name, email, password, cpf, role } = request.body as any;

    const createProfessionalService = new CreateProfessionalByAdminService();

    const result = await createProfessionalService.execute({
      name,
      email,
      password,
      cpf,
      role
    });

    return reply.status(201).send(result);
  }
}