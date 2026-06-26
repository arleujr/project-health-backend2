import { createHash, randomInt } from 'node:crypto';
import { Resend } from 'resend';
import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../config/env.js';

// Utility function to hash values using SHA-256
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export class OtpService {
  // Request a new OTP code for login
  async request(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Do not reveal whether the account exists
    if (!user) return { delivered: true };

    // Generate a random 6-digit code
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000);

    // Remove any previous unused OTPs for this email
    await prisma.loginOtp.deleteMany({ where: { email: user.email!, consumedAt: null } });

    // Save new OTP with hashed code
    await prisma.loginOtp.create({ data: { email: user.email!, codeHash: hash(code), expiresAt } });

    // Send OTP via Resend email service
    if (env.RESEND_API_KEY) {
      const resend = new Resend(env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: [user.email!],
        subject: 'Seu código de acesso — Projeto Health',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
            <h2>Projeto Health</h2>

            <p>Use o código abaixo para acessar sua conta:</p>

            <p
              style="
                font-size:32px;
                font-weight:700;
                letter-spacing:8px;
                margin:24px 0;
              "
            >
              ${code}
            </p>

            <p>
              O código expira em
              ${env.OTP_EXPIRES_MINUTES} minutos.
            </p>

            <p>
              Caso você não tenha solicitado este código,
              ignore esta mensagem.
            </p>
          </div>
        `,
      });

      if (error) {
        // Log error details for debugging
        console.error('Erro retornado pelo Resend:', {
          name: error.name,
          message: error.message,
        });

        throw new AppError('Não foi possível enviar o código de acesso.', 502);
      }

      // Log successful email delivery
      console.info('OTP enviado pelo Resend:', {
        emailId: data?.id,
      });
    } else if (env.NODE_ENV !== 'production') {
      // In development, return the code for testing
      return { delivered: true, devCode: code };
    } else {
      throw new AppError('Serviço de e-mail não configurado.', 503);
    }

    return { delivered: true };
  }

  // Verify an OTP code
  async verify(email: string, code: string) {
    const normalized = email.toLowerCase();

    // Get the latest OTP for this email
    const otp = await prisma.loginOtp.findFirst({
      where: { email: normalized, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    // Validate OTP expiration and attempts
    if (!otp || otp.expiresAt < new Date())
      throw new AppError('Código inválido ou expirado.', 401);

    if (otp.attempts >= env.OTP_MAX_ATTEMPTS)
      throw new AppError('Limite de tentativas excedido. Solicite outro código.', 429);

    // Check if provided code matches the stored hash
    if (otp.codeHash !== hash(code)) {
      await prisma.loginOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError('Código inválido ou expirado.', 401);
    }

    // Retrieve user details with updated select
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnboardingDone: true,
        onboardingStage: true,
      },
    });

    if (!user) throw new AppError('Usuário não encontrado.', 404);

    // Mark OTP as consumed and update access grants in a transaction
    const consumedAt = new Date();

    await prisma.$transaction([
      prisma.loginOtp.update({
        where: {
          id: otp.id,
        },
        data: {
          consumedAt,
        },
      }),

      prisma.accessGrant.updateMany({
        where: {
          userId: user.id,
          status: 'PENDING',
        },
        data: {
          status: 'ACCEPTED',
          consumedAt,
        },
      }),
    ]);

    return user;
  }
}
