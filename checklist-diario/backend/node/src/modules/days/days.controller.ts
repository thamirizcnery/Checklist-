import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import type {
  checkRequestSchema,
  getDayRequestSchema,
  listDaysRequestSchema,
} from './days.schemas.js';
import type { DaysService } from './days.service.js';

export const makeDaysController = (service: DaysService) => ({
  async list(_req: Request, res: Response) {
    const { query } = readValidated<z.infer<typeof listDaysRequestSchema>>(res);
    res.json(await service.listHistory(query.page, query.pageSize));
  },

  async getDay(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof getDayRequestSchema>>(res);
    res.json(await service.getDay(params.date));
  },

  async check(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof checkRequestSchema>>(res);
    res.json(await service.check(params.activityId));
  },

  async uncheck(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof checkRequestSchema>>(res);
    res.json(await service.uncheck(params.activityId));
  },
});
