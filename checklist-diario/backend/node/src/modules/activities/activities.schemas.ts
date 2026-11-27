import { z } from 'zod';

const MAX_PAGE_SIZE = 100;
export const MAX_NAME_LENGTH = 120;

const emptyObject = z.object({}).strict();

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Informe o nome da atividade')
  .max(MAX_NAME_LENGTH, `O nome pode ter até ${MAX_NAME_LENGTH} caracteres`);

const idParams = z.object({ id: z.coerce.number().int().positive() }).strict();

export const listActivitiesRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(50),
    })
    .strict(),
});

export const createActivityRequestSchema = z.object({
  body: z.object({ name: nameSchema }).strict(),
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});

export const renameActivityRequestSchema = z.object({
  body: z.object({ name: nameSchema }).strict(),
  params: idParams,
  query: emptyObject.default({}),
});

export const removeActivityRequestSchema = z.object({
  body: emptyObject.default({}),
  params: idParams,
  query: emptyObject.default({}),
});

export const reorderActivitiesRequestSchema = z.object({
  body: z.object({ ids: z.array(z.number().int().positive()) }).strict(),
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});
