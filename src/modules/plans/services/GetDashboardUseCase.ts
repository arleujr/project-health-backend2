import { prisma } from '../../../shared/infra/database/prisma.js';

export class GetDashboardUseCase {
  async execute(professionalId: string) {
    const plans = await prisma.plan.findMany({
      where: {
        OR: [
          { nutriId: professionalId },
          { efiId: professionalId }
        ],
        status: { in: ['ACTIVE', 'DRAFT'] }
      },
      select: {
        client: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            anamnesis: { select: { objectives: true } },
            mlInsights: {
              where: { isActive: true },
              orderBy: { generatedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const uniqueClientsMap = new Map<string, (typeof plans)[number]['client']>();
    for (const plan of plans) {
      if (plan.client && !uniqueClientsMap.has(plan.client.id)) {
        uniqueClientsMap.set(plan.client.id, plan.client);
      }
    }
    const patients = Array.from(uniqueClientsMap.values());

    let totalScore = 0;
    let riskCount = 0;

    const formattedPatients = patients.map(patient => {
      const latestInsight = patient.mlInsights[0];
      let status = 'GREEN';
      let score = 100;
      let trigger = null;
      let aiMessage = null;

      if (latestInsight) {
        score = Math.max(0, 100 - latestInsight.riskScore); 
        if (latestInsight.riskScore >= 70) {
          status = 'RED';
          riskCount++;
        } else if (latestInsight.riskScore >= 40) {
          status = 'YELLOW';
        }

        const insightTypeMap: Record<string, string> = {
          'CHURN_RISK': 'Risco de Cancelamento',
          'METABOLIC_PLATEAU': 'Platô Metabólico',
          'OVERTRAINING_ALERT': 'Alerta de Overtraining',
          'HIGH_PURCHASE_INTENT': 'Alta Intenção de Compra'
        };

        trigger = insightTypeMap[latestInsight.insightType] || latestInsight.insightType;
        aiMessage = latestInsight.recommendation;
      }

      totalScore += score;

      let goalText = 'Saúde Geral';
      if (patient.anamnesis?.objectives) {
        const obj = patient.anamnesis.objectives as Record<string, unknown> | unknown[];
        goalText = Array.isArray(obj) ? String(obj[0] ?? 'Avaliação Pendente') : String(obj.primaryGoal ?? 'Avaliação Pendente');
      }

      return {
        id: patient.id,
        name: patient.name || 'Paciente sem nome',
        status,
        score: Math.round(score),
        trigger,
        aiAnalysis: latestInsight ? `Confiança: ${latestInsight.confidenceLevel}` : undefined,
        aiMessage,
        goal: goalText,
        onboardingDate: new Intl.DateTimeFormat('pt-BR').format(patient.createdAt)
      };
    });

    const totalActive = patients.length;
    return {
      metrics: {
        totalActive,
        riskCount,
        averageHealthScore: totalActive > 0 ? Math.round(totalScore / totalActive) : 0,
        mrr: totalActive * 300
      },
      patients: formattedPatients
    };
  }
}