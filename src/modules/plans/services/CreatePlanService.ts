import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { CreatePlanDTO } from '../dtos/CreatePlanDTO.js';

export class CreatePlanService {
  async execute({ title, category, content, clientId, creatorId }: CreatePlanDTO) {
    const [creator, client] = await Promise.all([
      prisma.user.findUnique({ where: { id: creatorId } }),
      prisma.user.findUnique({ where: { id: clientId } }),
    ]);
    if (!creator) throw new AppError('Profissional não encontrado.', 404);
    if (!client || client.role !== 'CLIENT') throw new AppError('Cliente não encontrado.', 404);
    if (!['ADMIN', 'NUTRI', 'EFI'].includes(creator.role)) throw new AppError('Usuário sem permissão para prescrever.', 403);
    if (creator.role === 'NUTRI' && category !== 'NUTRITION') throw new AppError('Nutricionistas só podem prescrever dietas.', 403);
    if (creator.role === 'EFI' && category !== 'EXERCISE') throw new AppError('Profissionais de educação física só podem prescrever treinos.', 403);

    return prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({ data: { clientId, nutriId: creator.role === 'NUTRI' ? creatorId : null, efiId: creator.role === 'EFI' ? creatorId : null, createdById: creatorId, updatedById: creatorId, status: 'DRAFT' } });
      if (category === 'NUTRITION') {
        await tx.diet.create({ data: { planId: plan.id, title, dailyMacros: content.dailyMacros ?? {}, meals: content.meals ?? [] } });
      } else {
        await tx.workoutRoutine.create({ data: { planId: plan.id, title, splitType: content.splitType ?? 'Geral', metEstimated: content.metEstimated ?? 4.5, exercises: content.exercises ?? [] } });
      }
      return tx.plan.findUniqueOrThrow({ where: { id: plan.id }, include: { diets: true, workouts: true } });
    });
  }
}
