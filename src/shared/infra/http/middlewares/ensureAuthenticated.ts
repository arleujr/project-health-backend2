import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../../errors/AppError.js';

export async function ensureAuthenticated(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError('Token inválido, ausente ou expirado.', 401);
  }
}
