import { NotFoundError } from '../../shared/errors/not-found-error.js';
import { ValidationError } from '../../shared/errors/validation-error.js';

const ACTIVITY_NOT_FOUND = 'Atividade não encontrada';
const INVALID_ORDER = 'Envie todas as atividades, uma vez cada, na nova ordem';

export type ActivityRecord = { id: number; name: string; position: number };

export type ActivitiesRepository = {
  list: (page: number, pageSize: number) => Promise<{ data: ActivityRecord[]; total: number }>;
  /** Todas as ativas, por posição. */
  listAll: () => Promise<ActivityRecord[]>;
  findById: (id: number) => Promise<ActivityRecord | null>;
  create: (name: string, position: number) => Promise<ActivityRecord>;
  rename: (id: number, name: string) => Promise<ActivityRecord>;
  /** Exclusão lógica; as posições das que sobram são recompactadas (1, 2, 3...). */
  remove: (id: number) => Promise<void>;
  setOrder: (ids: number[]) => Promise<void>;
};

export const makeActivitiesService = (repo: ActivitiesRepository) => {
  const requireActive = async (id: number) => {
    const found = await repo.findById(id);
    if (!found) throw new NotFoundError(ACTIVITY_NOT_FOUND, 'ACTIVITY_NOT_FOUND');
    return found;
  };

  return {
    async list(page: number, pageSize: number) {
      const { data, total } = await repo.list(page, pageSize);
      return { data, page, pageSize, total };
    },

    async create(name: string) {
      const all = await repo.listAll();
      const last = all.reduce((max, item) => Math.max(max, item.position), 0);
      return repo.create(name, last + 1);
    },

    async rename(id: number, name: string) {
      await requireActive(id);
      return repo.rename(id, name);
    },

    async remove(id: number) {
      await requireActive(id);
      await repo.remove(id);
    },

    async reorder(ids: number[]) {
      const current = await repo.listAll();
      const sameSize = ids.length === current.length;
      const unique = new Set(ids);
      const known = new Set(current.map((item) => item.id));
      const valid = sameSize && unique.size === ids.length && ids.every((id) => known.has(id));
      if (!valid)
        throw new ValidationError(INVALID_ORDER, [{ path: 'ids', message: INVALID_ORDER }]);

      await repo.setOrder(ids);
      return repo.listAll();
    },
  };
};

export type ActivitiesService = ReturnType<typeof makeActivitiesService>;
