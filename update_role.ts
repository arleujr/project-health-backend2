import { prisma } from './src/shared/prisma/client.js';
import bcrypt from 'bcrypt';

async function main() {
  // Gerando a hash correta para a senha "senha123" usando o algoritmo do seu sistema
  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash('senha123', salt);

  // Atualiza o Rodrigo para garantir que ele é NUTRI e tem a senha conhecida
  const updatedUser = await prisma.user.update({
    where: { email: 'rodrigo@health.com' },
    data: { 
      role: 'NUTRI',
      password: hashedPassword // Sobrescreve a antiga hash desconhecida
    }
  });

  console.log(`\n🚀 SUCESSO: ${updatedUser.name} configurado de forma profissional!`);
  console.log(`📧 E-mail: ${updatedUser.email}`);
  console.log(`🔒 Senha de teste definida como: senha123\n`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });