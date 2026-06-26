import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreatePlanService } from '../services/CreatePlanService.js';

// 1. Definição estrita dos sub-schemas para os campos JSON de conteúdo
const ExerciseSchema = z.object({
  name: z.string().min(2, "O nome do exercício é obrigatório"),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  rest: z.number().int().nonnegative(),
});

const MealSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora deve ser HH:MM"),
  name: z.string().min(2),
  foods: z.array(z.string()).min(1, "A refeição precisa de pelo menos 1 alimento"),
});

// 2. Schema principal de validação do Body da Requisição
const createPlanBodySchema = z.object({
  clientId: z.string().uuid("O clientId deve ser um UUID válido"),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  category: z.enum(['NUTRITION', 'EXERCISE'], {
    errorMap: () => ({ message: "A categoria deve ser estritamente 'NUTRITION' ou 'EXERCISE'" })
  }),
  content: z.object({
    splitType: z.string().optional(),
    metEstimated: z.number().optional(),
    exercises: z.array(ExerciseSchema).optional(),
    dailyMacros: z.object({
      carboidratos: z.number(),
      proteinas: z.number(),
      gorduras: z.number(),
    }).optional(),
    meals: z.array(MealSchema).optional(),
  }),
});

export class CreatePlanController {
  public async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    // 🔑 MISSÃO 2: Extração exclusiva via sub do Fastify-JWT (Sem fallbacks ocultos)
    const userPayload = request.user as { sub?: string };
    const creatorId = userPayload?.sub;

    if (!creatorId) {
      return reply.status(401).send({
        status: 'error',
        message: 'Não foi possível identificar o ID do profissional no Token JWT.'
      });
    }

    // 🛡️ MISSÃO 1: Intercepção e validação do Body com Zod (Garante runtime limpo)
    const parseResult = createPlanBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        status: 'error',
        message: 'Falha na validação dos dados enviados.',
        errors: parseResult.error.format() // Retorna a árvore exata de onde a tipagem falhou
      });
    }

    // Dados 100% limpos e tipados sem nenhum 'as any'
    const { title, description, category, content, clientId } = parseResult.data;

    const createPlanService = new CreatePlanService();

    const plan = await createPlanService.execute({
      title,
      description,
      category,
      content,
      clientId,
      creatorId,
    });

    return reply.status(201).send(plan);
  }
}