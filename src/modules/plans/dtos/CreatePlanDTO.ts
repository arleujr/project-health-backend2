export interface CreatePlanDTO {
  title: string;
  description?: string;
  category: 'NUTRITION' | 'EXERCISE';
  content: any; // Aqui vai o JSON flexível com as refeições ou lista de exercícios
  clientId: string; // ID do aluno que vai receber
  creatorId: string; // ID da Nutri ou Personal que está criando
}