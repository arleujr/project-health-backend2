import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { UserRole } from '@prisma/client';

interface IRequest {
  adminId: string; // ID de quem está tentando fazer a alteração
  targetUserId: string; // ID de quem vai receber o novo cargo
  newRole: UserRole;
}

export class UpdateUserRoleService {
  public async execute({ adminId, targetUserId, newRole }: IRequest) {
    // 1. Valida se quem está chamando o serviço realmente existe e é um ADMIN
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('Apenas administradores master podem gerenciar a hierarquia do sistema.', 403);
    }

    // 2. Valida se o usuário que vai sofrer a alteração existe
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new AppError('Usuário destino não encontrado.', 404);
    }

    // 3. Atualiza o nível de acesso na hierarquia
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return updatedUser;
  }
}