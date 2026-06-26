import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestDTO {
  patientId: string;
}

export class GeneratePatientSummaryUseCase {
  public async execute({ patientId }: RequestDTO) {
    // 1. BUSCA OS DADOS (Sem expor o nome real para a IA no prompt final)
    const patientData = await prisma.user.findUnique({
      where: { id: patientId },
      include: {
        anamnesis: true,
        biometrics: {
          orderBy: { measuredAt: 'desc' },
          take: 1, // Pega só a última pesagem
        },
        clientTickets: {
          where: { status: 'OPEN' }, // Pega só o que está pendente
        },
      },
    });

    if (!patientData) {
      throw new Error('Paciente não encontrado.');
    }

    // 2. ANONIMIZAÇÃO E PREPARAÇÃO DO CONTEXTO (Zero Vazamento de Dados)
    const age = 35; // Aqui você calcularia a idade baseada na data de nascimento (se tiver no schema)
    const lastWeight = patientData.biometrics[0]?.weight || 'Não informado';
    const activeIssues = patientData.clientTickets.map(t => t.title).join(', ') || 'Nenhuma queixa ativa';
    
    const aiPrompt = `
      Atue como um assistente clínico de alta performance. 
      Resuma o status deste paciente em no máximo 4 linhas, com tom direto e profissional.
      Destaque se há riscos ou pontos de atenção.
      
      DADOS DO PACIENTE (Anonimizado):
      - Idade: ${age} anos
      - Último Peso: ${lastWeight}kg
      - Queixas/Tickets Abertos: ${activeIssues}
      - Objetivo principal: ${patientData.anamnesis?.objectives ? JSON.stringify(patientData.anamnesis.objectives) : 'Não preenchido'}
    `;

    // 3. A CHAMADA PARA A IA (OpenAI, Claude, etc.)
    // Como você ainda vai colocar a chave da API da OpenAI no .env, 
    // vamos deixar a estrutura pronta e retornar um texto simulado por enquanto para o Front-end não quebrar.
    
    /* const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4", // ou gpt-3.5-turbo para economizar
      messages: [{ role: "user", content: aiPrompt }],
    });
    const magicSummary = response.choices[0].message.content;
    */

    // Simulação do retorno da IA baseado nos dados reais do banco:
    const magicSummary = `Paciente apresenta estabilidade. Última pesagem indica ${lastWeight}kg. Atenção necessária para os seguintes chamados abertos: ${activeIssues || 'Nenhum'}. Sugere-se revisão de métricas na próxima semana.`;

    return {
      summary: magicSummary,
      generatedAt: new Date(),
    };
  }
}