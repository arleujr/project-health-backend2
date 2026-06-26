import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface SubmitClientAnamnesisInput {
  userId: string;
  weight: number;
  height: number;
  bodyFatPercent?: number;
  medicalConditions: string;
  medications: string;
  routine: string;
  injuries?: string;
  objectives?: string;
}

export class SubmitClientAnamnesisService {
  async execute({
    userId,
    weight,
    height,
    bodyFatPercent,
    medicalConditions,
    medications,
    routine,
    injuries,
    objectives,
  }: SubmitClientAnamnesisInput) {
    const normalizedHeight =
      height > 3 ? height / 100 : height;

    if (normalizedHeight < 1 || normalizedHeight > 2.5) {
      throw new AppError(
        'A altura informada é inválida.',
        400,
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
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
        'Somente clientes podem enviar a própria anamnese.',
        403,
      );
    }

    return prisma.$transaction(async (transaction) => {
      const anamnesis = await transaction.anamnesis.upsert({
        where: {
          userId,
        },

        update: {
          medicalRecord: {
            medicalConditions,
            medications,
            routine,
          },

          injuries: {
            description: injuries || null,
          },

          objectives: {
            primary: objectives || null,
          },
        },

        create: {
          userId,

          medicalRecord: {
            medicalConditions,
            medications,
            routine,
          },

          injuries: {
            description: injuries || null,
          },

          objectives: {
            primary: objectives || null,
          },
        },
      });

      const biometric = await transaction.biometricHistory.create({
        data: {
          userId,
          weight,
          height: normalizedHeight,
          bodyFatPercent,
          measuredAt: new Date(),
        },
      });

      return {
        message: 'Anamnese registrada com sucesso.',
        anamnesis: {
          id: anamnesis.id,
          updatedAt: anamnesis.updatedAt,
        },
        biometric: {
          id: biometric.id,
          measuredAt: biometric.measuredAt,
        },
      };
    });
  }
}