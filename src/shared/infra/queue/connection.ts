import { Redis } from 'ioredis';

// Instanciação compatível com tipos estritos e ESM do NodeNext
export const queueConnection = new (Redis as any)({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});