import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateAnamnesisService } from '../services/CreateAnamnesisService.js';
import { CreateAnamnesisDTO } from '../dtos/CreateAnamnesisDTO.js';

export class CreateAnamnesisController {
  public async handle(request: FastifyRequest, reply: FastifyReply) {
    // Pegamos o ID do usuário pelo cabeçalho ou token de autenticação
    const userId = (request.user as any)?.id || request.headers['x-user-id'];

    // Agora o payload da anamnese é ultracompleto
    const {
      medicalRecord,   // doenças, medicamentos, alergias, alimentos odiados, preferências alimentares
      injuries,        // histórico de lesões, avaliações médicas, dificuldades de execução
      objectives       // objetivos, frequência, histórico de treinos, dificuldades
    } = request.body as Omit<CreateAnamnesisDTO, 'userId'>;

    const createAnamnesisService = new CreateAnamnesisService();

    const anamnesis = await createAnamnesisService.execute({
      userId: userId as string,
      medicalRecord,
      injuries,
      objectives,
    });

    return reply.status(201).send({
      status: 'success',
      message: 'Anamnese registrada com sucesso',
      data: anamnesis
    });
  }
}
