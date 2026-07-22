import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import crmRoutes from './routes/crmRoutes';
import productRoutes from './routes/productRoutes';
import salesRoutes from './routes/salesRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import accountsRoutes from './routes/accountsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Ensure log directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

import purchaseRoutes from './routes/purchaseRoutes';
import workflowRoutes from './routes/workflowRoutes';
import aiFinanceRoutes from './routes/aiFinanceRoutes';
import importRoutes from './routes/importRoutes';
import swaggerRouter from './swagger/swaggerRouter';
import healthRoutes from './routes/healthRoutes';
import monitoringRoutes from './routes/monitoringRoutes';
import v1ApiRouter from './routes/v1ApiRouter';

// ─── Health & Monitoring Endpoints ───────────────────────────────────────────
app.use('/', healthRoutes);
app.use('/api', monitoringRoutes);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', v1ApiRouter);
app.use('/api/auth', authRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/ai-finance', aiFinanceRoutes);
app.use('/api/bulk', importRoutes);
app.use('/api', swaggerRouter);
app.use('/api', dashboardRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`🚀 OpsPilot API running on port ${config.port} [${config.nodeEnv}]`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async () => {
  logger.info('Shutting down server...');
  server.close(async () => {
    const { prisma } = await import('./config/prisma');
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
