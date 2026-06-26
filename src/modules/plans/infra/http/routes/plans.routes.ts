import type { FastifyInstance } from 'fastify';
import { CreatePlanController } from '../../../controllers/CreatePlanController.js';
import { GetClientPlanController } from '../../../controllers/GetClientPlanController.js';
import { GetProfessionalDashboardController } from '../../../controllers/GetProfessionalDashboardController.js';
import { GetPatientByIdController } from '../../../controllers/GetPatientByIdController.js';
import { ListPatientTicketsController } from '../../../controllers/ListPatientTicketsController.js';
import { GeneratePatientSummaryController } from '../../../controllers/GeneratePatientSummaryController.js';
import { ensureAuthenticated } from '../../../../../shared/infra/http/middlewares/ensureAuthenticated.js';
import { ensureRole } from '../../../../../shared/infra/http/middlewares/ensureRole.js';

export async function plansRoutes(app: FastifyInstance) {
  const professional = ensureRole(['ADMIN', 'NUTRI', 'EFI', 'ASSISTANT']);
  app.addHook('onRequest', ensureAuthenticated);
  app.post('/', { preHandler: [professional] }, new CreatePlanController().handle);
  app.get('/my-plan', { preHandler: [ensureRole(['CLIENT'])] }, new GetClientPlanController().handle);
  app.get('/dashboard', { preHandler: [professional] }, new GetProfessionalDashboardController().handle);
  app.get('/patient/:id', { preHandler: [professional] }, new GetPatientByIdController().handle);
  app.get('/patients/:id/tickets', { preHandler: [professional] }, new ListPatientTicketsController().handle);
  app.get('/patients/:id/summary', { preHandler: [professional] }, new GeneratePatientSummaryController().handle);
}
