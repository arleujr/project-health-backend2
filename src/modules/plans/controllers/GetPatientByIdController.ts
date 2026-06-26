import { FastifyRequest, FastifyReply } from 'fastify';
import { GetPatientByIdService } from '../services/GetPatientByIdService.js';

export class GetPatientByIdController {
  public async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extract ID from URL params (e.g., /patient/:id)
    const { id } = request.params as { id: string };

    // Security check: Block regular clients from accessing this professional route
    const userRole = (request.user as any)?.role;
    if (userRole === 'CLIENT') {
      return reply.status(403).send({
        status: 'error',
        message: 'Access denied. Professional level required.'
      });
    }

    const getPatientByIdService = new GetPatientByIdService();
    const patientData = await getPatientByIdService.execute({ patientId: id });

    return reply.status(200).send(patientData);
  }
}