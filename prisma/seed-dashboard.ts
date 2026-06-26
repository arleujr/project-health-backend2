import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando injeção de dados de teste...');

  // 0. Criando usuários profissionais (Nutricionista e Educador Físico)
  const nutri = await prisma.user.create({
    data: {
      name: 'Nutricionista Teste',
      email: 'nutri@teste.com',
      cpf: '99988877766',
      role: 'NUTRI',
      isOnboardingDone: true
    }
  });

  const efi = await prisma.user.create({
    data: {
      name: 'Educador Físico Teste',
      email: 'efi@teste.com',
      cpf: '88877766655',
      role: 'EFI',
      isOnboardingDone: true
    }
  });

  // 1. Criando um Paciente com Risco Alto (Semáforo Vermelho)
  const patient1 = await prisma.user.create({
    data: {
      name: 'Carlos Silva',
      email: 'carlos.risco@teste.com',
      cpf: '11122233355',
      role: 'CLIENT',
      isOnboardingDone: true,
      anamnesis: {
        create: {
          medicalRecord: { history: 'Hipertensão leve' },
          injuries: { details: 'Nenhuma' },
          objectives: { primaryGoal: 'Emagrecimento' }
        }
      },
      mlInsights: {
        create: {
          insightType: 'CHURN_RISK',
          riskScore: 85,
          confidenceLevel: 'HIGH',
          recommendation: 'Carlos não registra refeições há 4 dias. Chame-o no WhatsApp para reajustar as metas dessa semana.',
          featuresUsed: { daysInactive: 4 }
        }
      },
      clientPlans: {
        create: {
          nutriId: nutri.id,
          efiId: efi.id,
          status: 'ACTIVE'
        }
      }
    }
  });

  // 2. Criando um Paciente Engajado (Semáforo Verde)
  const patient2 = await prisma.user.create({
    data: {
      name: 'Marina Costa',
      email: 'marina.foco@teste.com',
      cpf: '22233344466',
      role: 'CLIENT',
      isOnboardingDone: true,
      anamnesis: {
        create: {
          medicalRecord: { history: 'Sem comorbidades' },
          injuries: { details: 'Lesão leve no joelho em 2022' },
          objectives: { primaryGoal: 'Hipertrofia' }
        }
      },
      mlInsights: {
        create: {
          insightType: 'HIGH_PURCHASE_INTENT',
          riskScore: 20,
          confidenceLevel: 'MEDIUM',
          recommendation: 'Marina está registrando todas as refeições e treinos. Continue incentivando novos desafios.',
          featuresUsed: { daysInactive: 0 }
        }
      },
      clientPlans: {
        create: {
          nutriId: nutri.id,
          efiId: efi.id,
          status: 'ACTIVE'
        }
      }
    }
  });

  console.log('✅ Seed concluído com sucesso!');
}

seed()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
