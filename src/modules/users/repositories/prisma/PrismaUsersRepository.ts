import { User, Prisma } from '@prisma/client';
import { prisma } from '../../../../shared/prisma/client.js';
import { IUsersRepository, IUserSessionContext } from '../IUsersRepository.js';

export class PrismaUsersRepository implements IUsersRepository {
  public async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  public async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  public async findUserSessionContext(id: string): Promise<IUserSessionContext | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: {
          select: {
            tier: true,
            status: true,
          },
        },
      },
    });

    return user as IUserSessionContext | null;
  }
}