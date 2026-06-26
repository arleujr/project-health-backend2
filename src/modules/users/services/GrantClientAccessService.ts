import {
  AccessGrantSource,
  UserRole,
} from '@prisma/client';

import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface GrantClientAccessInput {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  source: AccessGrantSource;
  createdById?: string;
  externalReference?: string;
}

export class GrantClientAccessService {
  public async execute({
    name,
    email,
    phone,
    cpf,
    source,
    createdById,
    externalReference,
  }: GrantClientAccessInput) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone =
      phone?.replace(/\D/g, '') || undefined;
    const normalizedCpf =
      cpf?.replace(/\D/g, '') || undefined;

    if (normalizedName.length < 2) {
      throw new AppError(
        'Informe um nome válido para o cliente.',
        400,
      );
    }

    if (
      normalizedPhone &&
      normalizedPhone.length < 10
    ) {
      throw new AppError(
        'Informe um telefone válido com DDD.',
        400,
      );
    }

    if (
      normalizedCpf &&
      normalizedCpf.length !== 11
    ) {
      throw new AppError(
        'O CPF deve possuir 11 dígitos.',
        400,
      );
    }

    const usersFound = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),

      normalizedPhone
        ? prisma.user.findUnique({
            where: {
              phone: normalizedPhone,
            },
          })
        : Promise.resolve(null),

      normalizedCpf
        ? prisma.user.findUnique({
            where: {
              cpf: normalizedCpf,
            },
          })
        : Promise.resolve(null),
    ]);

    const uniqueUsers = Array.from(
      new Map(
        usersFound
          .filter(
            (
              user,
            ): user is NonNullable<
              (typeof usersFound)[number]
            > => Boolean(user),
          )
          .map((user) => [user.id, user]),
      ).values(),
    );

    if (uniqueUsers.length > 1) {
      throw new AppError(
        'E-mail, telefone ou CPF estão vinculados a contas diferentes.',
        409,
      );
    }

    const existingUser = uniqueUsers[0];

    if (
      existingUser &&
      existingUser.role !== UserRole.CLIENT
    ) {
      throw new AppError(
        'Este e-mail ou documento pertence a um profissional do sistema.',
        409,
      );
    }

    if (
      existingUser?.email &&
      existingUser.email.toLowerCase() !==
        normalizedEmail
    ) {
      throw new AppError(
        'O telefone ou CPF informado já está vinculado a outro e-mail.',
        409,
      );
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        const user = existingUser
          ? await transaction.user.update({
              where: {
                id: existingUser.id,
              },
              data: {
                name:
                  existingUser.name ??
                  normalizedName,

                email:
                  existingUser.email ??
                  normalizedEmail,

                phone:
                  existingUser.phone ??
                  normalizedPhone,

                cpf:
                  existingUser.cpf ??
                  normalizedCpf,
              },
            })
          : await transaction.user.create({
              data: {
                name: normalizedName,
                email: normalizedEmail,
                phone: normalizedPhone,
                cpf: normalizedCpf,
                role: UserRole.CLIENT,
                isOnboardingDone: false,
                onboardingStage:
                  'BASIC_PROFILE_PENDING',
              },
            });

        const pendingGrant =
          await transaction.accessGrant.findFirst({
            where: {
              userId: user.id,
              email: normalizedEmail,
              status: 'PENDING',
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

        const expiresAt = new Date(
          Date.now() +
            30 * 24 * 60 * 60 * 1000,
        );

        const grant = pendingGrant
          ? await transaction.accessGrant.update({
              where: {
                id: pendingGrant.id,
              },
              data: {
                phone: normalizedPhone,
                cpf: normalizedCpf,
                source,
                createdById,
                externalReference,
                expiresAt,
              },
            })
          : await transaction.accessGrant.create({
              data: {
                email: normalizedEmail,
                phone: normalizedPhone,
                cpf: normalizedCpf,
                source,
                createdById,
                userId: user.id,
                externalReference,
                expiresAt,
              },
            });

        return {
          user,
          grant,
        };
      },
    );

    return {
      message:
        'Acesso liberado. O cliente já pode solicitar o código de entrada.',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        cpf: result.user.cpf,
        role: result.user.role,
        onboardingStage:
          result.user.onboardingStage,
      },
      grant: {
        id: result.grant.id,
        source: result.grant.source,
        status: result.grant.status,
        expiresAt: result.grant.expiresAt,
      },
    };
  }
}