import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBiometricHistoryService } from '../services/CreateBiometricHistoryService.js';

export class CreateOnboardingController {
  public async handle(request: FastifyRequest, reply: FastifyReply) {
    // 🔑 O Fastify injeta os dados do JWT decodificado em request.user. O ID fica em 'sub'
    const userId = (request.user as any)?.sub;

    if (!userId) {
      return reply.status(401).send({
        status: 'error',
        message: 'Usuário não identificado no token de autenticação.'
      });
    }

    const { weight, height, anthropometry, evolutionPhotos, medicalRecord, injuries, objectives } = request.body as any;

    const createBiometricHistory = new CreateBiometricHistoryService();

    // 🚀 Aqui passamos o userId coletado do Token junto com o resto do JSON
    const result = await createBiometricHistory.execute({
      userId,
      weight,
      height,
      anthropometry,
      evolutionPhotos,
      medicalRecord,
      injuries,
      objectives
    });

    return reply.status(201).send(result);
  }
}