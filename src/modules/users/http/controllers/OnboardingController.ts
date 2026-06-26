import { FastifyRequest, FastifyReply } from 'fastify';
import { PreRegisterClientService } from '../../services/PreRegisterClientService.js';
import { CompleteOnboardingService } from '../../services/CompleteOnboardingService.js';
import { SubmitAnamnesisService } from '../../services/SubmitAnamnesisService.js';

export class OnboardingController {
  // 1. Rota que simula o aviso de pagamento do Gateway (Kiwify/Stripe)
  public async preRegister(request: FastifyRequest, reply: FastifyReply) {
    const { cpf } = request.body as { cpf: string };
    
    const preRegisterService = new PreRegisterClientService();
    const user = await preRegisterService.execute({ cpf });

    return reply.status(201).send({ message: 'CPF liberado com sucesso!', userId: user.id });
  }

  // 2. Rota onde o aluno digita o CPF e preenche o cadastro no App
  public async complete(request: FastifyRequest, reply: FastifyReply) {
    const { cpf, name, email, phone, password } = request.body as any;

    const completeOnboarding = new CompleteOnboardingService();
    const result = await completeOnboarding.execute({ cpf, name, email, phone, password });

    return reply.status(200).send(result);
  }

  // 3. Rota onde o aluno envia o questionário de Anamnese
  public async submitAnamnesis(request: FastifyRequest, reply: FastifyReply) {
    const { userId, medicalRecord, injuries, objectives } = request.body as any;

    const submitAnamnesis = new SubmitAnamnesisService();
    const result = await submitAnamnesis.execute({ userId, medicalRecord, injuries, objectives });

    return reply.status(200).send(result);
  }
}