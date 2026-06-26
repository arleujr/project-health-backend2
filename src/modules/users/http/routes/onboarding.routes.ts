import type { FastifyInstance } from 'fastify';

import { OnboardingController } from '../controllers/OnboardingController.js';
import { AdminController } from '../controllers/AdminController.js';
import { AllowCpfByAdminController } from '../controllers/AllowCpfByAdminController.js';
import { GetClientAnamnesisController } from '../controllers/GetClientAnamnesisController.js';

import { CreateOnboardingController } from '../../controllers/CreateOnboardingController.js';
import { CompleteBasicProfileController } from '../../controllers/CompleteBasicProfileController.js';
import { CreateProfessionalByAdminController } from '../../controllers/CreateProfessionalByAdminController.js';

import { CreateDietPrescriptionController } from '../../../plans/controllers/CreateDietPrescriptionController.js';

import { ensureAuthenticated } from '../../../../shared/infra/http/middlewares/ensureAuthenticated.js';
import { ensureRole } from '../../../../shared/infra/http/middlewares/ensureRole.js';

export async function onboardingRouter(
  app: FastifyInstance,
): Promise<void> {
  const onboardingController =
    new OnboardingController();

  const adminController =
    new AdminController();

  const createOnboardingController =
    new CreateOnboardingController();

  const completeBasicProfileController =
    new CompleteBasicProfileController();

  const createProfessionalController =
    new CreateProfessionalByAdminController();

  const allowCpfController =
    new AllowCpfByAdminController();

  const getClientAnamnesisController =
    new GetClientAnamnesisController();

  const createDietPrescriptionController =
    new CreateDietPrescriptionController();

  app.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '15 minutes',
        },
      },
    },
    onboardingController.complete,
  );

  app.patch(
    '/basic-profile',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['CLIENT'])],
    },
    completeBasicProfileController.handle,
  );

  app.post(
    '/anamnesis',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['CLIENT'])],
    },
    createOnboardingController.handle,
  );

  app.patch(
    '/admin/change-role',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['ADMIN'])],
    },
    adminController.changeRole,
  );

  app.post(
    '/professionals',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['ADMIN'])],
    },
    createProfessionalController.handle,
  );

  app.post(
    '/allow-cpf',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['ADMIN'])],
    },
    allowCpfController.handle,
  );

  app.get(
    '/anamnesis/:userId',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [
        ensureRole(['ADMIN', 'NUTRI', 'EFI']),
      ],
    },
    getClientAnamnesisController.handle,
  );

  app.post(
    '/prescribe-diet',
    {
      onRequest: [ensureAuthenticated],
      preHandler: [ensureRole(['NUTRI'])],
    },
    createDietPrescriptionController.handle,
  );
}