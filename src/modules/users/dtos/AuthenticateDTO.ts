import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
// Ajustado para voltar uma pasta e entrar em services
import { AuthenticateUserService } from '../services/AuthenticateUserService.js'; 

// 1. Zod Schema
const authenticateOtpBodySchema = z.object({
  email: z.string().email("E-mail inválido").optional(),
  phone: z.string().min(10, "Telefone inválido").optional(),
  otpCode: z.string().length(6, "O código OTP deve ter exatamente 6 dígitos"),
}).refine(data => data.email || data.phone, {
  message: "Você deve fornecer ao menos o e-mail ou o telefone para realizar o login.",
  path: ["email"]
});

// 🚀 A MÁGICA AQUI: Exportamos o tipo extraído do Zod para o Service usar!
export type AuthenticateUserDTO = z.infer<typeof authenticateOtpBodySchema>;

// 2. O Controller
export class AuthenticateUserController {
  public async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    
    const parseResult = authenticateOtpBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        status: 'error',
        message: 'Dados de autenticação inválidos.',
        errors: parseResult.error.format()
      });
    }

    const { email, phone, otpCode } = parseResult.data;

    const authenticateUserService = new AuthenticateUserService();

    const result = await authenticateUserService.execute({
      email,
      phone,
      otpCode
    });

    return reply.status(200).send(result);
  }
}