import { prisma } from '../../../shared/prisma/client.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface IRequest {
  userId: string;
}

export class GetClientAnamnesisService {
  public async execute({ userId }: IRequest) {
    // 1. Fetch the user strictly ensuring they carry the CLIENT role
    const client = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!client) {
      throw new AppError('Client record not found.', 404);
    }

    // 2. Fetch the health profile record from the anamnesis table
    const anamnesis = await prisma.anamnesis.findUnique({
      where: { userId },
    });

    if (!anamnesis) {
      throw new AppError('Anamnesis profile has not been completed by this client yet.', 404);
    }

    return {
      client,
      anamnesis,
    };
  }
}