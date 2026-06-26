import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OtpService } from '../../services/OtpService.js';
import { ensureAuthenticated } from '../../../../shared/infra/http/middlewares/ensureAuthenticated.js';
import { prisma } from '../../../../shared/infra/database/prisma.js';

const emailSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase()) });
const verifySchema = emailSchema.extend({ otpCode: z.string().regex(/^\d{6}$/) });

export async function authRoutes(app: FastifyInstance) {
  const otp = new OtpService();
  app.post('/request-otp', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const { email } = emailSchema.parse(request.body);
    const result = await otp.request(email);
    return reply.status(202).send({ message: 'Se o e-mail estiver cadastrado, o código será enviado.', ...result });
  });
  app.post('/verify-otp', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (request, reply) => {
    const { email, otpCode } = verifySchema.parse(request.body);
    const user = await otp.verify(email, otpCode);
    const token = app.jwt.sign({ role: user.role, email: user.email }, { sub: user.id });
    return reply.send({ token, user });
  });
  app.get('/me', { onRequest: [ensureAuthenticated] }, async (request) => {
    return prisma.user.findUniqueOrThrow({ where: { id: request.user.sub }, select: { id: true, name: true, email: true, role: true, isOnboardingDone: true } });
  });
}
