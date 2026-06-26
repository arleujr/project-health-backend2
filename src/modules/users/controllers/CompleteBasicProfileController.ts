import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { z } from 'zod';

import { CompleteBasicProfileService } from '../services/CompleteBasicProfileService.js';

const completeBasicProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe um nome válido.')
    .max(120, 'O nome é muito longo.'),

  goal: z.enum([
    'WEIGHT_LOSS',
    'MUSCLE_GAIN',
    'HEALTH',
    'PERFORMANCE',
  ]),

  restriction: z
    .string()
    .trim()
    .max(
      2000,
      'O relato deve possuir no máximo 2000 caracteres.',
    )
    .optional()
    .default(''),

  termsAccepted: z
    .boolean()
    .refine(
      (value) => value,
      'Você precisa aceitar os termos de uso.',
    ),

  privacyAccepted: z
    .boolean()
    .refine(
      (value) => value,
      'Você precisa aceitar a política de privacidade.',
    ),
});

export class CompleteBasicProfileController {
  public handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.user.sub;

    const body = completeBasicProfileSchema.parse(
      request.body,
    );

    const service =
      new CompleteBasicProfileService();

    const result = await service.execute({
      userId,
      name: body.name,
      goal: body.goal,
      restriction: body.restriction,
      termsAccepted: body.termsAccepted,
      privacyAccepted: body.privacyAccepted,
    });

    return reply.status(200).send(result);
  };
}