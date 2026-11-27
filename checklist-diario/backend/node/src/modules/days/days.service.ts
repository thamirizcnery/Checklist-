import {
  addDays,
  daysBetweenInclusive,
  dayInSaoPaulo,
  type Clock,
} from '../../shared/clock/clock.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';

const ACTIVITY_NOT_FOUND = 'Atividade não encontrada';
const DAY_NOT_FOUND = 'Dia não encontrado';

export type DayActivityRecord = { id: number; name: string };
export type DaySummaryRecord = { day: string; done: number; total: number };

export type DaysRepository = {
  /** Atividades que existiam no dia (criadas até ele e removidas só depois dele), por posição. */
  activitiesOnDay: (day: string) => Promise<DayActivityRecord[]>;
  checkedActivityIds: (day: string) => Promise<number[]>;
  isActive: (activityId: number) => Promise<boolean>;
  addCheck: (activityId: number, day: string) => Promise<void>;
  removeCheck: (activityId: number, day: string) => Promise<void>;
  /** Primeiro dia (Brasília) em que existiu alguma atividade, ou null se nunca houve. */
  firstDay: () => Promise<string | null>;
  /** Um resumo por dia de `from` a `to`, em ordem crescente, incluindo dias sem marcação. */
  summaries: (from: string, to: string) => Promise<DaySummaryRecord[]>;
};

export type DayView = {
  date: string;
  done: number;
  total: number;
  activities: { id: number; name: string; done: boolean }[];
};

export const makeDaysService = (repo: DaysRepository, clock: Clock) => {
  const today = () => dayInSaoPaulo(clock());

  const buildDay = async (day: string): Promise<DayView> => {
    const [activities, checkedIds] = await Promise.all([
      repo.activitiesOnDay(day),
      repo.checkedActivityIds(day),
    ]);
    const checked = new Set(checkedIds);
    const items = activities.map((a) => ({ id: a.id, name: a.name, done: checked.has(a.id) }));
    return {
      date: day,
      done: items.filter((a) => a.done).length,
      total: items.length,
      activities: items,
    };
  };

  const requireActive = async (activityId: number) => {
    if (!(await repo.isActive(activityId))) {
      throw new NotFoundError(ACTIVITY_NOT_FOUND, 'ACTIVITY_NOT_FOUND');
    }
  };

  return {
    async getDay(param: string) {
      const current = today();
      if (param === 'today') return buildDay(current);

      if (param > current) throw new NotFoundError(DAY_NOT_FOUND, 'DAY_NOT_FOUND');
      const first = await repo.firstDay();
      if (first === null || param < first) {
        throw new NotFoundError(DAY_NOT_FOUND, 'DAY_NOT_FOUND');
      }
      return buildDay(param);
    },

    async check(activityId: number) {
      await requireActive(activityId);
      await repo.addCheck(activityId, today());
      return buildDay(today());
    },

    async uncheck(activityId: number) {
      await requireActive(activityId);
      await repo.removeCheck(activityId, today());
      return buildDay(today());
    },

    async listHistory(page: number, pageSize: number) {
      const current = today();
      const first = (await repo.firstDay()) ?? current;
      const total = daysBetweenInclusive(first, current);
      const offset = (page - 1) * pageSize;
      if (offset >= total) return { data: [], page, pageSize, total };

      const to = addDays(current, -offset);
      const earliest = addDays(to, -(pageSize - 1));
      const from = earliest < first ? first : earliest;

      const rows = await repo.summaries(from, to);
      const data = rows
        .map((row) => ({ date: row.day, done: row.done, total: row.total }))
        .reverse();
      return { data, page, pageSize, total };
    },
  };
};

export type DaysService = ReturnType<typeof makeDaysService>;
