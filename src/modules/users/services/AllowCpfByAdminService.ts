import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  cpf: string;
}

export class AllowCpfByAdminService {
  public async execute({ cpf }: IRequest): Promise<void> {
    const cleanCpf = cpf.replace(/\D/g, '');

    if (!cleanCpf || cleanCpf.length !== 11) {
      throw new AppError('CPF inválido. Certifique-se de enviar 11 dígitos.', 400);
    }

    // Check if the CPF is already pre-registered or linked to an existing account
    const userExists = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
    });

    if (userExists) {
      throw new AppError('Este CPF já está liberado ou cadastrado no sistema.', 400);
    }

    // Manually whitelist the client by creating a shell user record
    await prisma.user.create({
      data: {
        cpf: cleanCpf,
        role: 'CLIENT',
        isOnboardingDone: false,
      },
    });
  }
}