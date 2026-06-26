import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  cpf: string;
}

export class PreRegisterClientService {
  public async execute({ cpf }: IRequest) {
    const cleanCpf = cpf.replace(/\D/g, '');

    // Busca direta oficial porque o campo CPF agora existe no banco!
    const userExists = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
    });

    if (userExists) {
      throw new AppError('Este CPF já está liberado ou cadastrado no sistema.', 400);
    }

    // Criação nativa e limpa
    const user = await prisma.user.create({
      data: {
        cpf: cleanCpf,
        role: 'CLIENT',
        isOnboardingDone: false,
      },
    });

    return user;
  }
}