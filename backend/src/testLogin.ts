import prisma from './config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config';

async function test() {
  try {
    console.log('1. Connecting to DB...');
    const user = await prisma.user.findUnique({ where: { email: 'admin@opspilot.com' } });
    console.log('User found:', user ? user.email : 'NULL');

    if (!user) {
      console.log('2. User not found, seeding default admin user...');
      const passwordHash = await bcrypt.hash('password123', 12);
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@opspilot.com',
          name: 'Mithun',
          passwordHash,
          role: 'ADMIN',
        },
      });
      console.log('Created User:', newUser.email);
    }
  } catch (err: any) {
    console.error('❌ EXACT ERROR CAUSE:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
