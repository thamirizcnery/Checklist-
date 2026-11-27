import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import { makeDaysService, type DaysRepository } from './days.service.js';

// 25/11/2026 às 10:00 em Brasília
const NOVEMBER_25 = () => new Date('2026-11-25T13:00:00Z');

const makeRepo = (overrides: Partial<DaysRepository> = {}): DaysRepository => ({
  activitiesOnDay: vi.fn().mockResolvedValue([]),
  checkedActivityIds: vi.fn().mockResolvedValue([]),
  isActive: vi.fn().mockResolvedValue(true),
  addCheck: vi.fn().mockResolvedValue(undefined),
  removeCheck: vi.fn().mockResolvedValue(undefined),
  firstDay: vi.fn().mockResolvedValue('2026-11-20'),
  summaries: vi.fn().mockResolvedValue([]),
  ...overrides,
});

describe('getDay', () => {
  it('deve montar o dia de hoje com feitas e pendentes', async () => {
    const repo = makeRepo({
      activitiesOnDay: vi.fn().mockResolvedValue([
        { id: 1, name: 'Beber água' },
        { id: 2, name: 'Caminhar' },
        { id: 3, name: 'Ler' },
      ]),
      checkedActivityIds: vi.fn().mockResolvedValue([2]),
    });

    const day = await makeDaysService(repo, NOVEMBER_25).getDay('today');

    expect(repo.activitiesOnDay).toHaveBeenCalledWith('2026-11-25');
    expect(day).toEqual({
      date: '2026-11-25',
      done: 1,
      total: 3,
      activities: [
        { id: 1, name: 'Beber água', done: false },
        { id: 2, name: 'Caminhar', done: true },
        { id: 3, name: 'Ler', done: false },
      ],
    });
  });

  it('deve mostrar tudo pendente quando o relógio vira para o dia seguinte', async () => {
    const checks = new Map([['2026-11-25', [1, 2]]]);
    const repo = makeRepo({
      activitiesOnDay: vi.fn().mockResolvedValue([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]),
      checkedActivityIds: vi.fn((day: string) => Promise.resolve(checks.get(day) ?? [])),
    });
    // 00:00 de 26/11 em Brasília = 03:00 UTC
    const tomorrow = () => new Date('2026-11-26T03:00:00Z');

    const today = await makeDaysService(repo, tomorrow).getDay('today');
    const yesterday = await makeDaysService(repo, tomorrow).getDay('2026-11-25');

    expect(today.done).toBe(0);
    expect(today.activities.every((a) => !a.done)).toBe(true);
    expect(yesterday.done).toBe(2);
  });

  it('deve recusar dia futuro', async () => {
    const service = makeDaysService(makeRepo(), NOVEMBER_25);

    await expect(service.getDay('2026-11-26')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deve recusar dia anterior ao primeiro uso', async () => {
    const service = makeDaysService(makeRepo(), NOVEMBER_25);

    await expect(service.getDay('2026-11-19')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deve recusar dia passado quando ainda não há uso', async () => {
    const repo = makeRepo({ firstDay: vi.fn().mockResolvedValue(null) });

    await expect(makeDaysService(repo, NOVEMBER_25).getDay('2026-11-24')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('deve mostrar hoje com lista vazia quando não há atividades', async () => {
    const repo = makeRepo({ firstDay: vi.fn().mockResolvedValue(null) });

    await expect(makeDaysService(repo, NOVEMBER_25).getDay('today')).resolves.toEqual({
      date: '2026-11-25',
      done: 0,
      total: 0,
      activities: [],
    });
  });
});

describe('check e uncheck', () => {
  it('deve marcar a atividade no dia de hoje e devolver o dia atualizado', async () => {
    const repo = makeRepo({
      activitiesOnDay: vi.fn().mockResolvedValue([{ id: 1, name: 'A' }]),
      checkedActivityIds: vi.fn().mockResolvedValue([1]),
    });

    const day = await makeDaysService(repo, NOVEMBER_25).check(1);

    expect(repo.addCheck).toHaveBeenCalledWith(1, '2026-11-25');
    expect(day.done).toBe(1);
  });

  it('deve desmarcar a atividade no dia de hoje', async () => {
    const repo = makeRepo();

    await makeDaysService(repo, NOVEMBER_25).uncheck(1);

    expect(repo.removeCheck).toHaveBeenCalledWith(1, '2026-11-25');
  });

  it('deve recusar marcar atividade removida ou inexistente', async () => {
    const repo = makeRepo({ isActive: vi.fn().mockResolvedValue(false) });
    const service = makeDaysService(repo, NOVEMBER_25);

    await expect(service.check(9)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.uncheck(9)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.addCheck).not.toHaveBeenCalled();
    expect(repo.removeCheck).not.toHaveBeenCalled();
  });
});
