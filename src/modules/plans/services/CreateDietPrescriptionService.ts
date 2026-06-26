import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  clientId: string;
  nutriId: string;
  efiId: string; // ID do Educador Físico responsável pelo aluno
  title: string;
  dailyMacros: Record<string, any>;
  meals: Record<string, any>[];
}

export class CreateDietPrescriptionService {
  public async execute({ clientId, nutriId, efiId, title, dailyMacros, meals }: IRequest) {
    // 1. Validações estritas de segurança e papéis (Roles)
    const clientExists = await prisma.user.findFirst({ where: { id: clientId, role: 'CLIENT' } });
    if (!clientExists) throw new AppError('Cliente não encontrado.', 404);

    const efiExists = await prisma.user.findFirst({ where: { id: efiId, role: 'EFI' } });
    if (!efiExists) throw new AppError('Profissional de Educação Física inválido.', 400);

    const nutriExists = await prisma.user.findFirst({ where: { id: nutriId, role: 'NUTRI' } });
    if (!nutriExists) throw new AppError('Nutricionista inválido ou não autenticado.', 401);

    // 2. Transação única para salvar o plano e a dieta correspondente
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          clientId,
          nutriId,
          efiId,
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
      });

      const diet = await tx.diet.create({
        data: {
          planId: plan.id,
          title,
          dailyMacros,
          meals,
        },
      });

      // Ativa o aluno no sistema
      await tx.user.update({
        where: { id: clientId },
        data: { isOnboardingDone: true },
      });

      return { planId: plan.id, dietId: diet.id };
    });

    return result;
  }
}