import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { z } from 'zod';

import { SubmitClientAnamnesisService } from '../services/SubmitClientAnamnesisService.js';

const requiredNumber = z.preprocess(
  (value) => {
    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      return undefined;
    }

    return Number(value);
  },
  z
    .number({
      required_error: 'Este campo é obrigatório.',
      invalid_type_error: 'Informe um número válido.',
    })
    .finite(),
);

const optionalNumber = z.preprocess(
  (value) => {
    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      return undefined;
    }

    return Number(value);
  },
  z.number().finite().optional(),
);

const submitAnamnesisSchema = z.object({
  weight: requiredNumber.refine(
    (value) => value >= 20 && value <= 400,
    'O peso deve estar entre 20 e 400 kg.',
  ),

  height: requiredNumber.refine(
    (value) => value >= 1 && value <= 250,
    'Informe a altura em metros ou centímetros.',
  ),

  bodyFat: optionalNumber.refine(
    (value) =>
      value === undefined ||
      (value >= 0 && value <= 70),
    'O percentual de gordura deve estar entre 0 e 70.',
  ),

  medicalConditions: z
    .string()
    .trim()
    .max(5000)
    .default(''),

  medications: z
    .string()
    .trim()
    .max(5000)
    .default(''),

  routine: z
    .string()
    .trim()
    .max(5000)
    .default(''),

  injuries: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(''),

  objectives: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(''),
});

export class CreateOnboardingController {
  public handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.user.sub;

    const body = submitAnamnesisSchema.parse(
      request.body,
    );

    const service =
      new SubmitClientAnamnesisService();

    const result = await service.execute({
      userId,
      weight: body.weight,
      height: body.height,
      bodyFatPercent: body.bodyFat,
      medicalConditions: body.medicalConditions,
      medications: body.medications,
      routine: body.routine,
      injuries: body.injuries,
      objectives: body.objectives,
    });

    return reply.status(201).send(result);
  };
}