import express from 'express';
import { pinoHttp } from 'pino-http';
import { prisma } from './shared/database/prisma.js';
import { logger } from './shared/logger.js';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { requestId } from './shared/middlewares/request-id.js';
import { activitiesRouter } from './modules/activities/activities.routes.js';
import type { ActivitiesRepository } from './modules/activities/activities.service.js';
import { daysRouter } from './modules/days/days.routes.js';
import type { DaysRepository } from './modules/days/days.service.js';
import type { Clock } from './shared/clock/clock.js';

type AppDeps = {
  activitiesRepository?: ActivitiesRepository;
  daysRepository?: DaysRepository;
  clock?: Clock;
};

export const createApp = (deps: AppDeps = {}) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok' });
    } catch (error) {
      logger.warn({ err: error }, 'readiness check failed');
      res.status(503).json({
        error: { code: 'NOT_READY', message: 'Banco indisponível', details: [] },
      });
    }
  });

  app.use('/api/v1/activities', activitiesRouter(deps.activitiesRepository));
  app.use('/api/v1/days', daysRouter(deps.daysRepository, deps.clock));

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada', details: [] },
    });
  });

  app.use(errorHandler);
  return app;
};

export const app = createApp();
