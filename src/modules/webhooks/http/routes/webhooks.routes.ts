import type { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { z } from 'zod';

import { env } from '../../../../config/env.js';

const whatsappWebhookSchema = z.object({
  messageId: z.string().min(1),
  sender: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

let whatsappQueue: Queue | null = null;

function getWhatsappQueue(): Queue | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!whatsappQueue) {
    whatsappQueue = new Queue('WhatsAppIncoming', {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: 1,
      },
    });

    whatsappQueue.on('error', (error) => {
      console.error('WhatsApp queue error:', error);
    });
  }

  return whatsappQueue;
}

export async function webhooksRouter(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.post('/whatsapp', async (request, reply) => {
    const validatedData = whatsappWebhookSchema.parse(request.body);

    const queue = getWhatsappQueue();

    if (!queue) {
      fastify.log.warn(
        'Webhook received, but Redis is not configured. Message was not queued.',
      );

      return reply.status(503).send({
        received: false,
        error: 'QUEUE_UNAVAILABLE',
        message: 'O processamento de mensagens está temporariamente indisponível.',
      });
    }

    await queue.add(
      'process_message',
      {
        id: validatedData.messageId,
        phone: validatedData.sender,
        data: validatedData.payload,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );

    return reply.status(202).send({
      received: true,
      queued: true,
    });
  });

  fastify.addHook('onClose', async () => {
    if (whatsappQueue) {
      await whatsappQueue.close();
      whatsappQueue = null;
    }
  });
}