import { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { z } from 'zod';

// Decoupled clean connection blueprint mapping for standalone Redis instance management
const whatsappQueue = new Queue('WhatsAppIncoming', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

export async function webhooksRouter(fastify: FastifyInstance) {
  fastify.post('/whatsapp', async (request, reply) => {
    const whatsappWebhookSchema = z.object({
      messageId: z.string(),
      sender: z.string(),
      payload: z.record(z.string(), z.any()), // Corrected strict dynamic map key-value tracking matrix
    });

    const validatedData = whatsappWebhookSchema.parse(request.body);

    // Push heavy background task into BullMQ Redis cluster line
    await whatsappQueue.add(
      'process_message',
      {
        id: validatedData.messageId,
        phone: validatedData.sender,
        data: validatedData.payload,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );

    // Blazing-fast acknowledgment back to Meta Servers (Sub 20ms response loop)
    return reply.status(200).send({ received: true });
  });
}