import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { z } from 'zod';
import { AccessGrantSource } from '@prisma/client';

import { GrantClientAccessService } from '../../services/GrantClientAccessService.js';

const grantClientAccessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe um nome válido.')
    .max(120),

  email: z
    .string()
    .trim()
    .email('Informe um e-mail válido.')
    .transform((value) =>
      value.toLowerCase(),
    ),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal('')),

  cpf: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal('')),
});

export class GrantClientAccessController {
  public handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const body = grantClientAccessSchema.parse(
      request.body,
    );

    const requesterRole = request.user.role;

    const source =
      requesterRole === 'ADMIN'
        ? AccessGrantSource.ADMIN
        : AccessGrantSource.PROFESSIONAL;

    const service =
      new GrantClientAccessService();

    const result = await service.execute({
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      cpf: body.cpf || undefined,
      source,
      createdById: request.user.sub,
    });

    return reply.status(201).send(result);
  };
}