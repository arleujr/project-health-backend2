import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';

export function ensureRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError('Você não possui permissão para realizar esta ação.', 403);
    }
  };
}
