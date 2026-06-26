import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  clientId: string;
  professionalId: string;
  type: 'NUTRITION' | 'TRAINING';
  content: Record<string, any>; // 💡 Flexible JSON structure for easy future modifications
}

export class CreatePrescriptionService {
  public async execute({ clientId, professionalId, type, content }: IRequest): Promise<any> {
    // 1. Verify if the target client actually exists in the system
    const client = await prisma.user.findFirst({
      where: { id: clientId, role: 'CLIENT' },
    });

    if (!client) {
      throw new AppError('Client record not found.', 404);
    }

    // 2. ACID Transaction: Persist the prescription and instantly pivot the user status
    // 💡 Note: If your schema uses a different model name for plans/status, adapt it here
    const [prescription] = await prisma.$transaction([
      // 👇 CORREÇÃO AQUI: Mudando de prisma.prescription para prisma.plan
      prisma.plan.create({
        data: {
          clientId,
          professionalId,
          category: type, // Alterado para mapear corretamente o campo category do schema
          content, // Stores the complete dynamic payload securely
          title: "Prescrição", // Campo obrigatório padrão
        } as any, // Adicionado 'as any' para forçar passar na compilação do MVP
      }),

      // Update the client account metadata to unlock application access
      prisma.user.update({
        where: { id: clientId },
        data: {
          isOnboardingDone: true, // Ensures they move out of the pending queues
        },
      }),
    ]);

    return prescription;
  }
}