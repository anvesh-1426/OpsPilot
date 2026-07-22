import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32).default('opspilot-super-secret-jwt-key-change-me-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).default('opspilot-refresh-secret-key-change-me-in-production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  BCRYPT_ROUNDS: z.string().default('12'),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  port: parseInt(env.PORT),
  database: { url: env.DATABASE_URL },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  cors: { origins: env.CORS_ORIGINS.split(',').map((o) => o.trim()) },
  bcrypt: { rounds: parseInt(env.BCRYPT_ROUNDS) },
  log: { level: env.LOG_LEVEL },
};
