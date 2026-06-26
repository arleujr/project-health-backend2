import OpenAI from 'openai';
import { prisma } from '../../../shared/infra/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../config/env.js';

export class CopilotChatService {
  async execute({ message, userId }: { message: string; userId: string }): Promise<string> {
    if (!env.AI_API_KEY) throw new AppError('Serviço de IA não configurado.', 503);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    const client = new OpenAI({ apiKey: env.AI_API_KEY, baseURL: env.AI_BASE_URL });
    const systemPrompt = `Você é o copiloto do Projeto Health. Fale em português, seja objetivo e profissional. Usuário: ${user.name ?? 'Usuário'}; função: ${user.role}. Nunca invente dados clínicos. Dados retornados por ferramentas pertencem apenas ao escopo autorizado deste usuário.`;
    const tools = [{ type: 'function' as const, function: { name: 'get_active_patients_count', description: 'Quantidade de clientes ativos vinculados ao profissional autenticado.', parameters: { type: 'object', properties: {}, additionalProperties: false } } }];
    const first = await client.chat.completions.create({ model: env.AI_MODEL, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }], tools });
    const assistant = first.choices[0]?.message;
    if (!assistant) throw new AppError('A IA não retornou uma resposta.', 502);
    const call = assistant.tool_calls?.[0];
    if (!call || call.type !== 'function') return assistant.content ?? 'Não consegui responder agora.';
    let result = 'Ferramenta não disponível.';
    if (call.function.name === 'get_active_patients_count') {
      if (!['ADMIN', 'NUTRI', 'EFI', 'ASSISTANT'].includes(user.role)) throw new AppError('Ação não autorizada.', 403);
      const count = user.role === 'ADMIN'
        ? await prisma.subscription.count({ where: { status: 'ACTIVE', user: { role: 'CLIENT' } } })
        : await prisma.user.count({ where: { role: 'CLIENT', subscription: { status: 'ACTIVE' }, clientPlans: { some: { OR: [{ nutriId: userId }, { efiId: userId }] } } } });
      result = JSON.stringify({ activePatients: count });
    }
    const second = await client.chat.completions.create({ model: env.AI_MODEL, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }, assistant, { role: 'tool', tool_call_id: call.id, content: result }] });
    return second.choices[0]?.message.content ?? 'Não consegui processar os dados.';
  }
}
