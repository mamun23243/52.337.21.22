import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 12);
  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com' },
    update: { passwordHash, role: Role.SUPER_ADMIN },
    create: {
      name: 'System Administrator',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });
}

main().finally(() => prisma.$disconnect());
