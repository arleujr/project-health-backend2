import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../../../errors/AppError.js';
import { env } from '../../../../config/env.js';

export function globalExceptionHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ status: 'error', message: 'Dados inválidos.', issues: error.flatten() });
  }
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ status: 'error', message: error.message });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return reply.status(409).send({ status: 'error', message: 'Já existe um registro com esses dados.' });
    if (error.code === 'P2025') return reply.status(404).send({ status: 'error', message: 'Registro não encontrado.' });
  }
  request.log.error({ err: error }, 'Unhandled request error');
  return reply.status(500).send({
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Erro interno do servidor.' : error.message,
  });
}
