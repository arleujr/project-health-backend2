import { PrismaClient, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestDTO {
  professionalId: string;
  patientId: string;
}

export class ListPatientTicketsUseCase {
  public async execute({ professionalId, patientId }: RequestDTO) {
    
    const tickets = await prisma.supportTicket.findMany({
      where: {
        clientId: patientId,
        // agentId: professionalId, // Descomente isso depois se quiser que o profissional veja só os tickets DELE
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]
        }
      },
      orderBy: {
        slaExpiresAt: 'asc' 
      }
    });

    const now = new Date();

    const formattedTickets = tickets.map((ticket) => {
      const isOverdue = now > ticket.slaExpiresAt;
      let delayInHours = 0;

      if (isOverdue) {
        const diffInMs = now.getTime() - ticket.slaExpiresAt.getTime();
        delayInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      }

      return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        status: ticket.status,
        slaExpiresAt: ticket.slaExpiresAt,
        isOverdue,
        delayInHours: isOverdue ? delayInHours : 0
      };
    });

    return formattedTickets;
  }
}