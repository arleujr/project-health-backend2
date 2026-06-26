import type { FastifyInstance } from 'fastify';
import { CopilotController } from '../../controllers/CopilotController.js';
import { ensureAuthenticated } from '../../../../shared/infra/http/middlewares/ensureAuthenticated.js';

export async function copilotRoutes(app: FastifyInstance) {
  const controller = new CopilotController();
  app.post('/chat', { onRequest: [ensureAuthenticated], config: { rateLimit: { max: 20, timeWindow: '1 hour' } } }, controller.handle);
}
