import { Router } from 'express';
import { systemClock, type Clock } from '../../shared/clock/clock.js';
import { validate } from '../../shared/middlewares/validate.js';
import { makeDaysController } from './days.controller.js';
import { daysRepository } from './days.repository.js';
import { checkRequestSchema, getDayRequestSchema, listDaysRequestSchema } from './days.schemas.js';
import { makeDaysService, type DaysRepository } from './days.service.js';

export const daysRouter = (repo: DaysRepository = daysRepository, clock: Clock = systemClock) => {
  const controller = makeDaysController(makeDaysService(repo, clock));
  const router = Router();

  router.get('/', validate(listDaysRequestSchema), controller.list);
  router.get('/:date', validate(getDayRequestSchema), controller.getDay);
  // Marcar e desmarcar só existem para hoje: dias passados são consulta.
  router.put('/today/checks/:activityId', validate(checkRequestSchema), controller.check);
  router.delete('/today/checks/:activityId', validate(checkRequestSchema), controller.uncheck);

  return router;
};
