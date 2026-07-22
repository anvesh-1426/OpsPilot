"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32).default('opspilot-super-secret-jwt-key-change-me-in-production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32).default('opspilot-refresh-secret-key-change-me-in-production'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:5173'),
    BCRYPT_ROUNDS: zod_1.z.string().default('12'),
    LOG_LEVEL: zod_1.z.string().default('info'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
const env = parsed.data;
exports.config = {
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
//# sourceMappingURL=index.js.map