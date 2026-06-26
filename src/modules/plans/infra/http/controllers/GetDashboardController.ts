import { FastifyRequest, FastifyReply } from 'fastify';
// 💡 Apontando para o nome correto do serviço que você tem na pasta
import { GetDashboardUseCase } from '../../../services/GetDashboardUseCase.js';

export class GetProfessionalDashboardController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const professionalId = (request.user as any).sub;
    
    // 👇 ADICIONE ESTE LOG AQUI
    console.log(`\n📡 [DASHBOARD] Requisição recebida do profissional ID: ${professionalId}`);

    const getDashboardUseCase = new GetDashboardUseCase();
    const dashboardData = await getDashboardUseCase.execute(professionalId);

    // 👇 E ESTE LOG AQUI (Com proteção opcional para o TypeScript não reclamar do array)
    console.log(`✅ [DASHBOARD] Dados devolvidos: ${dashboardData?.patients?.length || 0} pacientes encontrados.`);

    return reply.status(200).send(dashboardData);
  }
}