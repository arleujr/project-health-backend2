import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  userId: string;
  medicalRecord: {
    hasDiabetes: boolean;
    hasHypertension: boolean;
    takesMedication: string[];
    observations: string;
  };
  injuries: {
    hasInjuries: boolean;
    details: string;
  };
  objectives: {
    mainGoal: 'HYPERTROPHY' | 'EMAGRECIMENTO' | 'PERFORMANCE' | 'SAUDE';
    targetWeight?: number;
    availableDaysPerWeek: number;
  };
}

export class SubmitAnamnesisService {
  public async execute({ userId, medicalRecord, injuries, objectives }: IRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuário não encontrado para vincular a anamnese.', 404);
    }

    // Salva ou atualiza a anamnese no banco de dados (usando os campos JSON mapeados no Prisma)
    const anamnesis = await prisma.anamnesis.upsert({
      where: { userId },
      create: {
        userId,
        medicalRecord: medicalRecord as any,
        injuries: injuries as any,
        objectives: objectives as any,
      },
      update: {
        medicalRecord: medicalRecord as any,
        injuries: injuries as any,
        objectives: objectives as any,
      }
    });

    // 🚀 AQUI É O GATILHO DA IA DE CONFORTO / PRÉ-TREINO
    // Com base no objetivo do aluno, já estruturamos o "Insight de Boas-Vindas"
    let aiOrientation = '';
    if (objectives.mainGoal === 'HYPERTROPHY') {
      aiOrientation = `Fala, ${user.name}! Foco total em Ganho de Massa. Enquanto seu treinador monta sua planilha oficial, comece aumentando sua ingestão de água para cerca de 35ml por kg de peso e garanta uma boa refeição com carboidratos complexos (como aveia ou batata doce) de 1h a 2h antes de treinar!`;
    } else if (objectives.mainGoal === 'EMAGRECIMENTO') {
      aiOrientation = `Olá, ${user.name}! Vamos juntos buscar sua melhor versão no emagrecimento. Estratégia inicial: procure manter um registro de tudo o que consome a partir de hoje e não zere os carboidratos de forma abrupta; a consistência no déficit calórico leve é o segredo!`;
    } else {
      aiOrientation = `Seja bem-vindo, ${user.name}! Seu foco em Saúde e Performance está registrado. Comece organizando seus horários de sono: dormir bem é o primeiro passo para otimizar seus hormônios e rendimento!`;
    }

    return {
      anamnesisId: anamnesis.id,
      message: 'Anamnese registrada com sucesso!',
      instantAiOrientation: aiOrientation // Esta string já aparece na tela do aluno na hora!
    };
  }
}