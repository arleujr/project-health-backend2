import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { env } from '../../../config/env.js';
import { authRoutes } from '../../../modules/users/http/routes/auth.routes.js';
import { onboardingRouter } from '../../../modules/users/http/routes/onboarding.routes.js';
import { plansRoutes } from '../../../modules/plans/infra/http/routes/plans.routes.js';
import { copilotRoutes } from '../../../modules/copilot/http/routes/copilot.routes.js';
import { webhooksRouter } from '../../../modules/webhooks/http/routes/webhooks.routes.js';
import { globalExceptionHandler } from './middlewares/globalExceptionHandler.js';

export function buildApp() {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },

    // Necessário porque o backend está atrás do proxy do Render.
    // Permite ao Fastify reconhecer o IP real encaminhado.
    trustProxy: true,
  });

  app.register(helmet);

  app.register(cors, {
    origin: env.FRONTEND_URL
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  app.setErrorHandler(globalExceptionHandler);

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'core-backend',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/ping', async () => {
    return {
      message: 'pong',
    };
  });

  app.register(authRoutes, {
    prefix: '/v1/auth',
  });

  app.register(onboardingRouter, {
    prefix: '/v1/onboarding',
  });

  app.register(plansRoutes, {
    prefix: '/v1/plans',
  });

  app.register(copilotRoutes, {
    prefix: '/v1/copilot',
  });

  app.register(webhooksRouter, {
    prefix: '/v1/webhooks',
  });

  return app;
}

export const app = buildApp();