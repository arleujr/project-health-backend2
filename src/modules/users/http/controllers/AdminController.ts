import { FastifyRequest, FastifyReply } from 'fastify';
import { UpdateUserRoleService } from '../../services/UpdateUserRoleService.js';

export class AdminController {
  public async changeRole(request: FastifyRequest, reply: FastifyReply) {
    const { targetUserId, newRole } = request.body as any;
    const adminId = (request as any).user?.id || request.headers['x-admin-id']; // Fallback para testes iniciais sem JWT ativo

    const updateUserRole = new UpdateUserRoleService();
    
    const userWithNewRole = await updateUserRole.execute({
      adminId: adminId as string,
      targetUserId,
      newRole
    });

    return reply.status(200).send({
      message: 'Hierarquia atualizada com sucesso!',
      user: userWithNewRole
    });
  }
}