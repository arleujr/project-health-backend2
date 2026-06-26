import { FastifyRequest, FastifyReply } from 'fastify';
import { GetClientAnamnesisService } from '../../services/GetClientAnamnesisService.js';

export class GetClientAnamnesisController {
  public async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { userId } = request.params as { userId: string };

    const getClientAnamnesisService = new GetClientAnamnesisService();
    const clientProfile = await getClientAnamnesisService.execute({ userId });

    return reply.status(200).send(clientProfile);
  }
}