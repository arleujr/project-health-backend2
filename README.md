# Projeto Health — Backend

API Fastify + TypeScript + Prisma para o Projeto Health.

## Desenvolvimento
1. Copie `.env.example` para `.env`.
2. Configure `DATABASE_URL`, `DIRECT_URL` e `JWT_SECRET`.
3. Execute `npm ci`, `npx prisma migrate deploy`, `npm run dev`.

## Deploy no Render
- Root directory: pasta deste backend.
- Build: `npm ci && npm run build && npm run prisma:migrate:deploy`
- Start: `npm start`
- Health check: `/health`
- Configure as variáveis listadas em `.env.example`.

Para Supabase, use a URL do Session Pooler em `DATABASE_URL` e a conexão direta em `DIRECT_URL`. Nunca versione `.env`.
