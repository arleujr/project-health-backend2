import 'dotenv/config';
import { app } from './app.js';
import { env } from '../../../config/env.js';
import { prisma } from '../database/prisma.js';

async function start() {
  try {
    await prisma.$connect();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info({ port: env.PORT }, 'Projeto Health API started');
  } catch (error) {
    app.log.fatal({ err: error }, 'Unable to start API');
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  app.log.info({ signal }, 'Shutting down');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
void start();
