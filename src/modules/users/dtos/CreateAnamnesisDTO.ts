export interface CreateAnamnesisDTO {
  userId: string;
  medicalRecord: {
    diseases?: string[];
    medications?: string[];
    allergies?: string[];
    hatedFoods?: string[]; // 🍏 Alimentos rejeitados (Fígado, coentro, etc.)
    gastrointestinalHealth: {
      frequentBloating: boolean;
      bowelMovementDaily: boolean;
      observations?: string;
    };
    waterIntakeLiters: number;
    chrononutrition: {
      wakeUpTime: string;
      sleepTime: string;
      highestHungerPeak: 'MORNING' | 'LUNCH' | 'LATE_AFTERNOON' | 'NIGHT';
    };
    // 💸 Fator Socioeconômico e Restrições Especiais
    budgetBracket: 'LOW_COST' | 'MODERATE' | 'PREMIUM'; // Evita empurrar salmão se não couber no bolso
    cookingTimeAvailable: 'NONE_PRACTICAL' | 'MED_SOME_DAYS' | 'HIGH_PREP_LOTE';
    hasMealInfrastructure: boolean; // Acesso a geladeira/micro-ondas no trabalho/rotina
    neurodivergenceOrSpecialCondition?: {
      isAtypicalMotherOrCarer: boolean; // Mães autistas / cuidadoras
      sensoryFoodSelectivity: boolean; // Seletividade estrita por texturas/cores (comum em TEA)
      specialConditionNotes?: string;
    };
  };
  injuries: {
    hasInjuries: boolean;
    details?: string;
    executionDifficulties?: string[]; // 🏋️ Exercícios/músculos específicos que geram dor/estalo
    pastEvaluationsHistory?: string; // 📜 Histórico clínico/relatórios passados
  };
  objectives: {
    primaryGoal: string;
    targetEnvironment: 'COMMERCIAL_GYM' | 'HOME' | 'CONDO_GYM' | 'OUTDOOR'; // Onde vai treinar
    medicalRecommendationRequirement?: string; // Se o médico exigiu o exercício para tratar algo (Ex: Hérnia)
    performanceTransferSport?: string; // Treinar para render mais em outro esporte (Ex: Jiu-jitsu, corrida)
    timeframeWeeks?: number;
    activityFrequencyPerWeek?: number;
    lifestyle: {
      professionType: 'SEDENTARY_DESK_JOB' | 'ACTIVE_STANDING' | 'MANUAL_LABOR';
      dailyStressLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      averageSleepHours: number;
      // 🍻 Estilo de Vida Real
      alcoholConsumption: {
        frequency: 'NEVER' | 'OCCASIONAL_WEEKEND' | 'FREQUENT';
        makesPointOfDrinking: boolean; // Se o aluno faz questão absoluta da sua cerveja
        notes?: string;
      };
    };
    lastWorkoutsSummary?: {
      style: string;
      experienceTimeMonths: number;
      currentSuplements?: string[];
    };
    pastEvaluationsData?: string; // 📊 Espaço para colar dados rápidos de avaliações passadas (Peso antigo, % gordura antigo)
  };
}