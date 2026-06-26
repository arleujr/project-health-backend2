import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../../shared/infra/database/prisma.js';
import { GetDashboardUseCase } from '../services/GetDashboardUseCase.js';

export class GetProfessionalDashboardController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const dashboard = await new GetDashboardUseCase().execute(request.user.sub);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.user.sub }, select: { id: true, name: true, role: true } });
    return reply.send({ user, ...dashboard });
  }
}
