import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CopilotChatService } from '../services/CopilotChatService.js';

const bodySchema = z.object({ message: z.string().trim().min(1).max(2000) });
export class CopilotController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { message } = bodySchema.parse(request.body);
    const response = await new CopilotChatService().execute({ message, userId: request.user.sub });
    return reply.send({ reply: response });
  }
}
