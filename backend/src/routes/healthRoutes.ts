import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/health', async (_req, res) => {
  const startTime = Date.now();
  let dbStatus = 'UP';
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - startTime;
  } catch (err) {
    dbStatus = 'DOWN';
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const healthData = {
    status: dbStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptimeSeconds: Math.floor(uptimeSeconds),
    services: {
      api: { status: 'UP' },
      database: { status: dbStatus, latencyMs: dbLatencyMs },
    },
    system: {
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      rssMb: Math.round(memory.rss / 1024 / 1024),
    },
  };

  const statusCode = dbStatus === 'UP' ? 200 : 503;
  return res.status(statusCode).json(healthData);
});

router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'READY', message: 'System is ready to accept traffic' });
  } catch (err) {
    return res.status(503).json({ status: 'NOT_READY', message: 'Database connection unavailable' });
  }
});

router.get('/live', (_req, res) => {
  return res.status(200).json({ status: 'ALIVE', uptime: process.uptime() });
});

export default router;
