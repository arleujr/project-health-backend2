import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface CreateBiometricHistoryDTO {
  userId: string;
  weight: number;
  height: number;
  anthropometry: {
    torax: number;
    cintura: number;
    quadril: number;
    braço_esquerdo?: number;
    braço_direito?: number;
  };
  evolutionPhotos: {
    frontalUrl: string;
    perfilUrl: string;
    costasUrl: string;
  };
  medicalRecord: {
    diseases: string[];
    medications: string[];
    allergies: string[];
    hatedFoods: string[];
    gastrointestinalHealth: {
      frequentBloating: boolean;
      bowelMovementDaily: boolean;
      observations?: string;
    };
    waterIntakeLiters: number;
    chrononutrition: {
      wakeUpTime: string;
      sleepTime: string;
      highestHungerPeak: string;
    };
    budgetBracket: 'LOW_COST' | 'MODERATE' | 'PREMIUM';
    cookingTimeAvailable: 'NONE_PRACTICAL' | 'MED_SOME_DAYS' | 'HIGH_PREP_LOTE';
    hasMealInfrastructure: boolean;
    neurodivergenceOrSpecialCondition?: {
      isAtypicalMotherOrCarer: boolean;
      sensoryFoodSelectivity: boolean;
      specialConditionNotes?: string;
    };
  };
  injuries: {
    hasInjuries: boolean;
    details?: string;
    executionDifficulties?: string[];
    pastEvaluationsHistory?: string;
  };
  objectives: {
    primaryGoal: string;
    targetEnvironment: 'COMMERCIAL_GYM' | 'HOME' | 'CONDO_GYM' | 'OUTDOOR';
    medicalRecommendationRequirement?: string;
    performanceTransferSport?: string;
    timeframeWeeks: number;
    activityFrequencyPerWeek: number;
    lifestyle: {
      professionType: string;
      dailyStressLevel: string;
      averageSleepHours: number;
      alcoholConsumption: {
        frequency: 'NEVER' | 'OCCASIONAL_WEEKEND' | 'FREQUENT';
        makesPointOfDrinking: boolean;
        notes?: string;
      };
    };
    lastWorkoutsSummary: {
      style: string;
      experienceTimeMonths: number;
      currentSuplements?: string[];
    };
    pastEvaluationsData?: string;
  };
}

export class CreateBiometricHistoryService {
  public async execute({
    userId,
    weight,
    height,
    anthropometry,
    evolutionPhotos,
    medicalRecord,
    injuries,
    objectives
  }: CreateBiometricHistoryDTO) {
    // 1. Valida se o usuário existe de fato
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new AppError('Usuário não encontrado para registrar o onboarding.', 444);
    }

    // 2. Transação do Prisma: Salva nas duas tabelas diferentes ao mesmo tempo. Se uma falhar, desfaz tudo.
    const [biometric, anamnesis] = await prisma.$transaction([
      // Salva peso, fotos e medidas na tabela de Biometria
      prisma.biometricHistory.create({
        data: {
          userId,
          weight,
          height,
          anthropometry: anthropometry as any,
          evolutionPhotos: evolutionPhotos as any,
          measuredAt: new Date()
        }
      }),

      // Salva todo o questionário de saúde, inclusão e rotina na tabela de Anamnese
      prisma.anamnesis.upsert({
        where: { userId },
        update: {
          medicalRecord: medicalRecord as any,
          injuries: injuries as any,
          objectives: objectives as any,
        },
        create: {
          userId,
          medicalRecord: medicalRecord as any,
          injuries: injuries as any,
          objectives: objectives as any,
        }
      })
    ]);

    // 3. Marca o onboarding como feito na tabela de usuários
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboardingDone: true }
    });

    // Retorna o combo completo para o app do aluno comemorar
    return {
      biometric,
      anamnesis
    };
  }
}