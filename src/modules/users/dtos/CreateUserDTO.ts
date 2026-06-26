import { UserRole } from '@prisma/client';

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // Optional context for validation alignment
}