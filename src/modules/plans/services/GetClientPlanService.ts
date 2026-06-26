import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  clientId: string;
}

export class GetClientPlanService {
  public async execute({ clientId }: IRequest) {
    // 1. Busca o plano mais recente (pelo mais novo createdAt) atrelado ao aluno
    const plan = await prisma.plan.findFirst({
      where: {
        clientId: clientId,
        // Se você quiser filtrar apenas planos ativos no futuro, descomente a linha abaixo:
        // status: 'ACTIVE' 
      },
      orderBy: {
        createdAt: 'desc' // Traz o último plano passado pelo profissional
      },
      include: {
        diets: true,    // Traz a dieta acoplada se houver
        workouts: true  // Traz o treino acoplado se houver
      }
    });

    if (!plan) {
      throw new AppError('Nenhum plano alimentar ou de treino encontrado para este usuário.', 404);
    }

    return plan;
  }
}