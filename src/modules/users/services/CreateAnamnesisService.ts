import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { CreateAnamnesisDTO } from '../dtos/CreateAnamnesisDTO.js';

export class CreateAnamnesisService {
  public async execute({ userId, medicalRecord, injuries, objectives }: CreateAnamnesisDTO) {
    // 1. Garante a integridade relacional do banco
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new AppError('Usuário não encontrado para vincular esta anamnese.', 444);
    }

    // 2. Salva ou atualiza a estrutura em JSON (Evita duplicar linhas na tabela)
    const anamnesis = await prisma.anamnesis.upsert({
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
      },
    });

    // 3. Trava de segurança empresarial: Aluno concluiu a anamnese, o onboarding está pago e liberado
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboardingDone: true }
    });

    return anamnesis;
  }
}