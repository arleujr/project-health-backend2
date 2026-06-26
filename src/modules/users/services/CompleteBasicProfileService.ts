import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';

export type PrimaryGoal =
  | 'WEIGHT_LOSS'
  | 'MUSCLE_GAIN'
  | 'HEALTH'
  | 'PERFORMANCE';

interface CompleteBasicProfileInput {
  userId: string;
  name: string;
  goal: PrimaryGoal;
  restriction?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export class CompleteBasicProfileService {
  public async execute({
    userId,
    name,
    goal,
    restriction,
    termsAccepted,
    privacyAccepted,
  }: CompleteBasicProfileInput) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        termsAcceptedAt: true,
        privacyAcceptedAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        'Usuário não encontrado.',
        404,
      );
    }

    if (user.role !== 'CLIENT') {
      throw new AppError(
        'Somente clientes podem concluir este perfil.',
        403,
      );
    }

    if (!termsAccepted || !privacyAccepted) {
      throw new AppError(
        'É necessário aceitar os termos e a política de privacidade.',
        400,
      );
    }

    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name.trim(),
        primaryGoal: goal,
        restrictionSummary:
          restriction?.trim() || null,
        onboardingStage:
          'CLINICAL_PROFILE_PENDING',
        termsAcceptedAt:
          user.termsAcceptedAt ?? now,
        privacyAcceptedAt:
          user.privacyAcceptedAt ?? now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        primaryGoal: true,
        restrictionSummary: true,
        onboardingStage: true,
        termsAcceptedAt: true,
        privacyAcceptedAt: true,
      },
    });

    return {
      message: 'Perfil básico concluído com sucesso.',
      user: updatedUser,
      nextStep: 'CLINICAL_ANAMNESIS',
    };
  }
}