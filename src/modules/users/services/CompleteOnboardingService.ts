import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';
import bcryptjs from 'bcryptjs';

interface IRequest {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export class CompleteOnboardingService {
  public async execute({ cpf, name, email, phone, password }: IRequest) {
    // 🚨 VALIDAÇÃO CRUCIAL: Se não enviar o CPF, barra aqui antes de quebrar o .replace()
    if (!cpf) {
      throw new AppError('O campo CPF é obrigatório para concluir o cadastro.', 400);
    }

    const cleanCpf = cpf.replace(/\D/g, '');

    // Busca oficial por CPF única e rápida
    const user = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
    });

    if (!user) {
      throw new AppError('CPF não autorizado. Efetue o pagamento para liberar seu acesso.', 403);
    }

    if (user.isOnboardingDone) {
      throw new AppError('O cadastro para este CPF já foi concluído.', 400);
    }

    // Verifica se o e-mail já está em uso
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new AppError('Este e-mail já está em uso.', 400);
    }

    const hashedPassword = password ? await bcryptjs.hash(password, 8) : undefined;

    // Atualização oficial direto pelo CPF
    const updatedUser = await prisma.user.update({
      where: { cpf: cleanCpf },
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        isOnboardingDone: true,
      },
    });

    const contractTerms = `TERMOS DE USO E CONTRATO DE PRESTAÇÃO DE SERVIÇOS HEALTH TECH. Contratante: ${name}, CPF: ${cpf}. Ao concluir este cadastro, o usuário aceita os termos de monitoramento de saúde e consultoria esportiva/nutricional...`;

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
      contract: {
        generatedAt: new Date(),
        document: contractTerms,
        status: 'ACCEPTED_BY_CLICK'
      }
    };
  }
}