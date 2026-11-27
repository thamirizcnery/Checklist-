import { describe, expect, it, vi } from 'vitest';
import { makeDaysService, type DaysRepository } from './days.service.js';

const NOVEMBER_25 = () => new Date('2026-11-25T13:00:00Z');

const makeRepo = (overrides: Partial<DaysRepository> = {}): DaysRepository => ({
  activitiesOnDay: vi.fn().mockResolvedValue([]),
  checkedActivityIds: vi.fn().mockResolvedValue([]),
  isActive: vi.fn().mockResolvedValue(true),
  addCheck: vi.fn().mockResolvedValue(undefined),
  removeCheck: vi.fn().mockResolvedValue(undefined),
  firstDay: vi.fn().mockResolvedValue('2026-11-23'),
  summaries: vi.fn().mockResolvedValue([]),
  ...overrides,
});

describe('listHistory', () => {
  it('deve listar do dia mais recente ao mais antigo, incluindo hoje', async () => {
    const repo = makeRepo({
      summaries: vi.fn().mockResolvedValue([
        { day: '2026-11-23', done: 3, total: 3 },
        { day: '2026-11-24', done: 0, total: 3 },
        { day: '2026-11-25', done: 1, total: 4 },
      ]),
    });

    const result = await makeDaysService(repo, NOVEMBER_25).listHistory(1, 30);

    expect(repo.summaries).toHaveBeenCalledWith('2026-11-23', '2026-11-25');
    expect(result).toEqual({
      data: [
        { date: '2026-11-25', done: 1, total: 4 },
        { date: '2026-11-24', done: 0, total: 3 },
        { date: '2026-11-23', done: 3, total: 3 },
      ],
      page: 1,
      pageSize: 30,
      total: 3,
    });
  });

  it('deve paginar sem pedir dias antes do primeiro uso', async () => {
    const repo = makeRepo({ summaries: vi.fn().mockResolvedValue([]) });

    await makeDaysService(repo, NOVEMBER_25).listHistory(2, 2);

    // página 1 = 25 e 24; página 2 = só 23 (primeiro dia de uso)
    expect(repo.summaries).toHaveBeenCalledWith('2026-11-23', '2026-11-23');
  });

  it('deve devolver lista vazia quando a página passa do fim', async () => {
    const repo = makeRepo();

    const result = await makeDaysService(repo, NOVEMBER_25).listHistory(5, 30);

    expect(result.data).toEqual([]);
    expect(result.total).toBe(3);
    expect(repo.summaries).not.toHaveBeenCalled();
  });

  it('deve mostrar só hoje quando ainda não há atividades', async () => {
    const repo = makeRepo({
      firstDay: vi.fn().mockResolvedValue(null),
      summaries: vi.fn().mockResolvedValue([{ day: '2026-11-25', done: 0, total: 0 }]),
    });

    const result = await makeDaysService(repo, NOVEMBER_25).listHistory(1, 30);

    expect(result.total).toBe(1);
    expect(result.data).toEqual([{ date: '2026-11-25', done: 0, total: 0 }]);
  });
});
