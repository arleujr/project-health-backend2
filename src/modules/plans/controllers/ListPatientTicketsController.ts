// ============================================================================
// BACK-END: ListPatientTicketsController with authentication safety guard
// ============================================================================
import { FastifyRequest, FastifyReply } from 'fastify';
import { ListPatientTicketsUseCase } from '../services/ListPatientTicketsUseCase.js'; // Ajuste o caminho se necessário

export class ListPatientTicketsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // 🛡️ Safety guard: Prevent crash if request.user is null or undefined
    if (!request.user) {
      return reply.status(401).send({
        status: 'error',
        message: 'Authentication context missing.'
      });
    }

    try {
      // ✅ Safely extract userId (sub) after null check
      const professionalId = (request.user as any).sub;

      // ✅ Extract patientId from route params (/patients/:id/tickets)
      const { id: patientId } = request.params as { id: string };

      // ✅ Run SLA engine (business logic)
      const listTicketsUseCase = new ListPatientTicketsUseCase();
      const tickets = await listTicketsUseCase.execute({
        professionalId,
        patientId
      });

      // ✅ Return tickets to frontend
      return reply.status(200).send({ tickets });
    } catch (error) {
      console.error("Error listing patient tickets:", error);
      return reply.status(500).send({ 
        status: 'error',
        message: 'Internal server error.' 
      });
    }
  }
}
