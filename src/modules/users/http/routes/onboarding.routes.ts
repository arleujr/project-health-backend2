import { FastifyInstance } from 'fastify';
import { z } from 'zod'; // 🛡️ Importando o Zod para a Missão 1
import { OnboardingController } from '../controllers/OnboardingController.js';
import { AdminController } from '../controllers/AdminController.js';
import { AuthenticateUserService } from '../../services/AuthenticateUserService.js';
import { CreateOnboardingController } from '../../controllers/CreateOnboardingController.js';
import { CreateProfessionalByAdminController } from '../../controllers/CreateProfessionalByAdminController.js';
import { AllowCpfByAdminController } from '../controllers/AllowCpfByAdminController.js';
import { GetClientAnamnesisController } from '../controllers/GetClientAnamnesisController.js';
import { CreateDietPrescriptionController } from '../../../plans/controllers/CreateDietPrescriptionController.js';

// 🛡️ MISSÃO 1: Schema de validação do Passwordless (Atrito Zero)
const authenticateOtpBodySchema = z.object({
  email: z.string().email("E-mail inválido").optional(),
  phone: z.string().min(10, "Telefone inválido").optional(),
  otpCode: z.string().length(6, "O código OTP deve ter exatamente 6 dígitos"),
}).refine(data => data.email || data.phone, {
  message: "Você deve fornecer ao menos o e-mail ou o telefone para realizar o login.",
  path: ["email"]
});

export async function onboardingRouter(app: FastifyInstance) {
  const controller = new OnboardingController();
  const adminController = new AdminController();
  const createOnboardingController = new CreateOnboardingController();
  const createProfessionalByAdminController = new CreateProfessionalByAdminController();
  const allowCpfByAdminController = new AllowCpfByAdminController();
  const getClientAnamnesisController = new GetClientAnamnesisController();
  const createDietPrescriptionController = new CreateDietPrescriptionController();

  // Public route: completes a client registration previously authorized by an administrator/payment webhook.
  // Public routes: Webhook processing and initial user signup
  app.post('/register', controller.complete);

  // Protected route: Multi-stage patient anamnesis profile submission
  app.post('/anamnesis', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ status: 'error', message: 'Invalid or missing authentication token.' });
      }
    }]
  }, createOnboardingController.handle);

  // Protected route: Administrative authorization engine modification
  app.patch('/admin/change-role', { onRequest: [async (request) => { await request.jwtVerify(); if (request.user.role !== 'ADMIN') throw new Error('FORBIDDEN'); }] }, adminController.changeRole);

  // Protected route: Administrative resource handling for corporate team ingestion
  app.post('/professionals', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ status: 'error', message: 'Invalid or missing token.' });
      }
    }]
  }, createProfessionalByAdminController.handle);

  // Protected route: Secure inline bypass validation for payment gateways
  app.post('/allow-cpf', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
        
        // MISSÃO 2: Extração limpa via request.user sem fallbacks obscuros
        const { role } = request.user as { role: string };
        if (role !== 'ADMIN') {
          return reply.status(403).send({ status: 'error', message: 'Access denied. Insufficient permissions.' });
        }
      } catch (err) {
        return reply.status(401).send({ status: 'error', message: 'Invalid or missing authentication token.' });
      }
    }]
  }, allowCpfByAdminController.handle);

  // 🔒 Protected route: Allows professionals (NUTRI/EFI) to audit specific patient health profiles
  app.get('/anamnesis/:userId', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
        
        const { role } = request.user as { role: string };
        if (role !== 'NUTRI' && role !== 'EFI') {
          return reply.status(403).send({ status: 'error', message: 'Access denied. Only health professionals can view anamneses.' });
        }
      } catch (err) {
        return reply.status(401).send({ status: 'error', message: 'Invalid or missing authentication token.' });
      }
    }]
  }, getClientAnamnesisController.handle);

  // 🔒 Protected route: Allows only NUTRITIONISTS to prescribe diets and activate clients
  app.post('/prescribe-diet', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
        const { role } = request.user as { role: string };
        if (role !== 'NUTRI') {
          return reply.status(403).send({ status: 'error', message: 'Access denied. Only nutritionists can prescribe diets.' });
        }
      } catch (err) {
        return reply.status(401).send({ status: 'error', message: 'Invalid or missing authentication token.' });
      }
    }]
  }, createDietPrescriptionController.handle);
}