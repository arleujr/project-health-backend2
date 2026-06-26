import 'dotenv/config';
import { authConfig } from './src/config/auth.js';
import bcryptjs from 'bcryptjs';

console.log("=== TESTE DE MOTOR ===");
console.log("Criptografia Bcrypt:", typeof bcryptjs.compare);
console.log("Configuração do JWT carregada:", !!authConfig.jwt.secret);
console.log("======================");