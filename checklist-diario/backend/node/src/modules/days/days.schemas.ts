import { z } from 'zod';
import { isValidDay } from '../../shared/clock/clock.js';

const MAX_PAGE_SIZE = 100;

const emptyObject = z.object({}).strict();

const dateParam = z.union([
  z.literal('today'),
  z.string().refine(isValidDay, { message: 'Use o formato AAAA-MM-DD ou "today"' }),
]);

const activityId = z.coerce.number().int().positive();

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(30),
  })
  .strict();

export const getDayRequestSchema = z.object({
  body: emptyObject.default({}),
  params: z.object({ date: dateParam }).strict(),
  query: emptyObject.default({}),
});

export const checkRequestSchema = z.object({
  body: emptyObject.default({}),
  params: z.object({ activityId }).strict(),
  query: emptyObject.default({}),
});

export const listDaysRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: paginationSchema,
});
