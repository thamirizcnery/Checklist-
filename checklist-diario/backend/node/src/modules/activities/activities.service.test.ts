import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import { ValidationError } from '../../shared/errors/validation-error.js';
import {
  makeActivitiesService,
  type ActivitiesRepository,
  type ActivityRecord,
} from './activities.service.js';

const activity = (overrides: Partial<ActivityRecord> = {}): ActivityRecord => ({
  id: 1,
  name: 'Beber água',
  position: 1,
  ...overrides,
});

const makeRepo = (overrides: Partial<ActivitiesRepository> = {}): ActivitiesRepository => ({
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  listAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  create: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn().mockResolvedValue(undefined),
  setOrder: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('create', () => {
  it('deve criar na primeira posição quando a lista está vazia', async () => {
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(activity()) });

    await makeActivitiesService(repo).create('Beber água');

    expect(repo.create).toHaveBeenCalledWith('Beber água', 1);
  });

  it('deve criar no fim da lista', async () => {
    const repo = makeRepo({
      listAll: vi
        .fn()
        .mockResolvedValue([activity({ id: 1, position: 1 }), activity({ id: 2, position: 2 })]),
      create: vi.fn().mockResolvedValue(activity({ id: 3, position: 3 })),
    });

    await makeActivitiesService(repo).create('Caminhar');

    expect(repo.create).toHaveBeenCalledWith('Caminhar', 3);
  });

  it('deve aceitar nome repetido', async () => {
    const repo = makeRepo({
      listAll: vi.fn().mockResolvedValue([activity({ name: 'Caminhar' })]),
      create: vi.fn().mockResolvedValue(activity({ id: 2, name: 'Caminhar', position: 2 })),
    });

    await expect(makeActivitiesService(repo).create('Caminhar')).resolves.toMatchObject({
      name: 'Caminhar',
    });
  });
});

describe('rename', () => {
  it('deve renomear atividade ativa', async () => {
    const renamed = activity({ name: 'Ler e-mails da manhã' });
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(activity()),
      rename: vi.fn().mockResolvedValue(renamed),
    });

    await expect(makeActivitiesService(repo).rename(1, 'Ler e-mails da manhã')).resolves.toEqual(
      renamed,
    );
    expect(repo.rename).toHaveBeenCalledWith(1, 'Ler e-mails da manhã');
  });

  it('deve lançar NotFoundError quando a atividade não existe ou foi removida', async () => {
    const repo = makeRepo();

    await expect(makeActivitiesService(repo).rename(9, 'X')).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.rename).not.toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('deve remover atividade ativa', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(activity()) });

    await makeActivitiesService(repo).remove(1);

    expect(repo.remove).toHaveBeenCalledWith(1);
  });

  it('deve lançar NotFoundError quando a atividade não existe', async () => {
    const repo = makeRepo();

    await expect(makeActivitiesService(repo).remove(1)).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});

describe('reorder', () => {
  const current = [
    activity({ id: 1, name: 'A', position: 1 }),
    activity({ id: 2, name: 'B', position: 2 }),
    activity({ id: 3, name: 'C', position: 3 }),
  ];

  it('deve aplicar a nova ordem quando todos os ids aparecem uma vez', async () => {
    const listAll = vi
      .fn()
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce([
        activity({ id: 3, name: 'C', position: 1 }),
        activity({ id: 1, name: 'A', position: 2 }),
        activity({ id: 2, name: 'B', position: 3 }),
      ]);
    const repo = makeRepo({ listAll });

    const result = await makeActivitiesService(repo).reorder([3, 1, 2]);

    expect(repo.setOrder).toHaveBeenCalledWith([3, 1, 2]);
    expect(result.map((a) => a.id)).toEqual([3, 1, 2]);
  });

  it.each([
    ['faltando um id', [1, 2]],
    ['com id repetido', [1, 1, 2]],
    ['com id desconhecido', [1, 2, 99]],
  ])('deve recusar lista %s', async (_label, ids) => {
    const repo = makeRepo({ listAll: vi.fn().mockResolvedValue(current) });

    await expect(makeActivitiesService(repo).reorder(ids)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.setOrder).not.toHaveBeenCalled();
  });
});

describe('list', () => {
  it('deve devolver a página com o total', async () => {
    const repo = makeRepo({
      list: vi.fn().mockResolvedValue({ data: [activity()], total: 1 }),
    });

    await expect(makeActivitiesService(repo).list(1, 50)).resolves.toEqual({
      data: [activity()],
      page: 1,
      pageSize: 50,
      total: 1,
    });
  });
});
