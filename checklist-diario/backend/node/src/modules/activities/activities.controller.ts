import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import type {
  createActivityRequestSchema,
  listActivitiesRequestSchema,
  removeActivityRequestSchema,
  renameActivityRequestSchema,
  reorderActivitiesRequestSchema,
} from './activities.schemas.js';
import type { ActivitiesService } from './activities.service.js';

export const makeActivitiesController = (service: ActivitiesService) => ({
  async list(_req: Request, res: Response) {
    const { query } = readValidated<z.infer<typeof listActivitiesRequestSchema>>(res);
    res.json(await service.list(query.page, query.pageSize));
  },

  async create(_req: Request, res: Response) {
    const { body } = readValidated<z.infer<typeof createActivityRequestSchema>>(res);
    res.status(201).json(await service.create(body.name));
  },

  async rename(_req: Request, res: Response) {
    const { params, body } = readValidated<z.infer<typeof renameActivityRequestSchema>>(res);
    res.json(await service.rename(params.id, body.name));
  },

  async remove(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof removeActivityRequestSchema>>(res);
    await service.remove(params.id);
    res.status(204).send();
  },

  async reorder(_req: Request, res: Response) {
    const { body } = readValidated<z.infer<typeof reorderActivitiesRequestSchema>>(res);
    res.json({ data: await service.reorder(body.ids) });
  },
});
