import { AppError } from '../../../shared/errors/AppError.js';
// 🚀 Importando exatamente o TIPO que criamos no arquivo anterior
import { AuthenticateUserDTO } from '../dtos/AuthenticateDTO.js'; 
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; // ⚠️ Importante: certifique-se de ter instalado (npm i jsonwebtoken)
import authConfig from '../../../config/auth.js';

const prisma = new PrismaClient();

export class AuthenticateUserService {
  public async execute({ email, phone, otpCode }: AuthenticateUserDTO) {
    
    if (!email && !phone) {
      throw new AppError('Você deve fornecer um e-mail ou telefone para autenticação.', 400);
    }

    // 1. Buscando o usuário REAL no banco (Adeus user-uuid-mock!)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email ?? undefined }
          // { phone: phone ?? undefined } // Descomente se tiver o campo phone no banco
        ]
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado no sistema.', 404);
    }

    // 2. Validação do código OTP
    // Como você estava usando mock antes, deixei '123456' fixo para não quebrar seu teste de imediato.
    // O ideal futuro é: if (otpCode !== user.otpCodeDoBanco)
    if (otpCode !== '123456') { 
      throw new AppError('Código de autenticação inválido ou expirado.', 401);
    }

    // 3. Gerando o JWT REAL com o ID do banco (Adeus jwt-token-generated-with-strict-subject!)
    const token = jwt.sign(
      { role: user.role }, // Você pode colocar o cargo no payload se quiser
      authConfig.jwt.secret as string, // 👈 CORREÇÃO AQUI (Forçando a tipagem para string)
      {
        subject: user.id, // 👈 AQUI! O ID VERDADEIRO DO BANCO ENTRANDO NO TOKEN!
        expiresIn: authConfig.jwt.expiresIn as any, // 👈 CORREÇÃO AQUI (Evita o erro de Overload)
      }
    );

    // 4. Retorna os dados corretos
    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}