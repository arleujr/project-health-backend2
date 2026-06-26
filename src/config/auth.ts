export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'uma-chave-secreta-extremamente-longa-e-segura-para-o-projeto-health',
    expiresIn: '15m',
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'outra-chave-super-secreta-para-atualizar-o-token-de-acesso',
    expiresIn: '7d',
  }
};

// 🚀 Adicione isso no final do arquivo por garantia de importação:
export default authConfig;