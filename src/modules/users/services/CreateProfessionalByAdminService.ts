import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';
import pkg from 'bcryptjs';
const { hash } = pkg;

interface IRequest {
  name: string;
  email: string;
  password?: string; // Senha padrão opcional (se não mandar, criamos uma)
  cpf: string;
  role: 'NUTRI' | 'EFI' | 'ADMIN';
}

export class CreateProfessionalByAdminService {
  public async execute({ name, email, password, cpf, role }: IRequest) {
    // 1. Valida se o papel (role) escolhido é válido para profissional
    if (!['NUTRI', 'EFI', 'ADMIN'].includes(role)) {
      throw new AppError('Cargo inválido para o cadastro administrativo.', 400);
    }

    // 2. Verifica se o e-mail já está em uso
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new AppError('Este endereço de e-mail já está cadastrado no sistema.', 400);
    }

    // 3. Verifica se o CPF já está em uso
    const cpfExists = await prisma.user.findUnique({ where: { cpf } });
    if (cpfExists) {
      throw new AppError('Este CPF já está cadastrado no sistema.', 400);
    }

    // 4. Criptografa a senha (usa a enviada ou define uma padrão segura)
    const rawPassword = password || 'mudar@123';
    const hashedPassword = await hash(rawPassword, 8);

    // 5. Salva direto no banco com onboarding concluído (eles não precisam responder anamnese)
    const professional = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        role,
        isOnboardingDone: true // Profissional pula a onboarding de aluno
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return {
      professional,
      temporaryPassword: rawPassword // Devolve para o admin mandar pro profissional
    };
  }
}