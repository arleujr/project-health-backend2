import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../../../errors/AppError.js';
import { env } from '../../../../config/env.js';

export function globalExceptionHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 1. Handle custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
    });
  }

  // 2. Handle validation errors from Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: 'error',
      message: 'Dados inválidos.',
      issues: error.flatten(),
    });
  }

  // 3. Handle HTTP errors from Fastify (including rate limit 429)
  if (
    typeof (error as any).statusCode === 'number' &&
    (error as any).statusCode >= 400 &&
    (error as any).statusCode < 500
  ) {
    return reply.status((error as any).statusCode).send({
      message: error.message,
      statusCode: (error as any).statusCode,
    });
  }

  // Handle Prisma known request errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        status: 'error',
        message: 'Já existe um registro com esses dados.',
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        status: 'error',
        message: 'Registro não encontrado.',
      });
    }
  }

  // Log unexpected errors
  request.log.error({ err: error }, 'Unhandled request error');

  // 4. Unknown error fallback
  return reply.status(500).send({
    message:
      env.NODE_ENV === 'production'
        ? 'Erro interno do servidor.'
        : error.message,
    statusCode: 500,
  });
}
