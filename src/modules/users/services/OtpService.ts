import { createHash, randomInt } from 'node:crypto';
import { Resend } from 'resend';
import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../config/env.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export class OtpService {
  async request(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Do not reveal whether the account exists.
    if (!user) return { delivered: true };

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000);
    await prisma.loginOtp.deleteMany({ where: { email: user.email!, consumedAt: null } });
    await prisma.loginOtp.create({ data: { email: user.email!, codeHash: hash(code), expiresAt } });

    if (env.RESEND_API_KEY) {
      const resend = new Resend(env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM, to: [user.email!], subject: 'Seu código de acesso — Projeto Health',
        html: `<p>Seu código de acesso é:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>Ele expira em ${env.OTP_EXPIRES_MINUTES} minutos.</p>`,
      });
      if (error) throw new AppError('Não foi possível enviar o código de acesso.', 502);
    } else if (env.NODE_ENV !== 'production') {
      return { delivered: true, devCode: code };
    } else {
      throw new AppError('Serviço de e-mail não configurado.', 503);
    }
    return { delivered: true };
  }

  async verify(email: string, code: string) {
    const normalized = email.toLowerCase();
    const otp = await prisma.loginOtp.findFirst({
      where: { email: normalized, consumedAt: null }, orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) throw new AppError('Código inválido ou expirado.', 401);
    if (otp.attempts >= env.OTP_MAX_ATTEMPTS) throw new AppError('Limite de tentativas excedido. Solicite outro código.', 429);
    if (otp.codeHash !== hash(code)) {
      await prisma.loginOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new AppError('Código inválido ou expirado.', 401);
    }
    const user = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true, name: true, email: true, role: true, isOnboardingDone: true } });
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    await prisma.loginOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
    return user;
  }
}
