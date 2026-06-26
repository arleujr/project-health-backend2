import { FastifyRequest, FastifyReply } from 'fastify';
import { GetClientPlanService } from '../services/GetClientPlanService.js';

export class GetClientPlanController {
  public async handle(request: FastifyRequest, reply: FastifyReply) {
    // 🔑 Segurança máxima: O ID do aluno vem direto do Token de quem abriu o app
    const clientId = (request.user as any)?.sub;

    if (!clientId) {
      return reply.status(401).send({
        status: 'error',
        message: 'Usuário não autenticado.'
      });
    }

    const getClientPlanService = new GetClientPlanService();
    const plan = await getClientPlanService.execute({ clientId });

    return reply.status(200).send(plan);
  }
}