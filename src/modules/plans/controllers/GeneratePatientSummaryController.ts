import { FastifyRequest, FastifyReply } from 'fastify';
import { GeneratePatientSummaryUseCase } from '../services/GeneratePatientSummaryUseCase.js';

export class GeneratePatientSummaryController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: patientId } = request.params as { id: string };

    const generateSummaryUseCase = new GeneratePatientSummaryUseCase();
    
    // Gera o resumo
    const result = await generateSummaryUseCase.execute({ patientId });

    return reply.status(200).send(result);
  }
}