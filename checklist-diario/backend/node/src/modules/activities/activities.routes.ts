import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.js';
import { makeActivitiesController } from './activities.controller.js';
import { activitiesRepository } from './activities.repository.js';
import {
  createActivityRequestSchema,
  listActivitiesRequestSchema,
  removeActivityRequestSchema,
  renameActivityRequestSchema,
  reorderActivitiesRequestSchema,
} from './activities.schemas.js';
import { makeActivitiesService, type ActivitiesRepository } from './activities.service.js';

export const activitiesRouter = (repo: ActivitiesRepository = activitiesRepository) => {
  const controller = makeActivitiesController(makeActivitiesService(repo));
  const router = Router();

  router.get('/', validate(listActivitiesRequestSchema), controller.list);
  router.post('/', validate(createActivityRequestSchema), controller.create);
  router.put('/order', validate(reorderActivitiesRequestSchema), controller.reorder);
  router.patch('/:id', validate(renameActivityRequestSchema), controller.rename);
  router.delete('/:id', validate(removeActivityRequestSchema), controller.remove);

  return router;
};
