// 🚀 Corrected path pointing to your shared database infrastructure
import { prisma } from '../../../shared/infra/database/prisma.js'; 

interface Request {
  patientId: string;
}

export class GetPatientByIdService {
  public async execute({ patientId }: Request) {
    // Fetch patient with active plans and related diets
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: {
        anamnesis: true,
        clientPlans: {
          where: { status: 'ACTIVE' },
          include: { diets: true, workouts: true }
        }
      }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patient;
  }
}