import { prisma } from '../../shared/database/prisma.js';
import type { ActivitiesRepository, ActivityRecord } from './activities.service.js';

const select = { id: true, name: true, position: true } as const;
const active = { deletedAt: null } as const;
const byPosition = [{ position: 'asc' }, { id: 'asc' }] as const;

type Row = { id: bigint; name: string; position: number };
const toRecord = (row: Row): ActivityRecord => ({
  id: Number(row.id),
  name: row.name,
  position: row.position,
});

export const activitiesRepository: ActivitiesRepository = {
  async list(page, pageSize) {
    const [rows, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where: active,
        orderBy: [...byPosition],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select,
      }),
      prisma.activity.count({ where: active }),
    ]);
    return { data: rows.map(toRecord), total };
  },

  async listAll() {
    const rows = await prisma.activity.findMany({
      where: active,
      orderBy: [...byPosition],
      select,
    });
    return rows.map(toRecord);
  },

  async findById(id) {
    const row = await prisma.activity.findFirst({ where: { id: BigInt(id), ...active }, select });
    return row ? toRecord(row) : null;
  },

  async create(name, position) {
    return toRecord(await prisma.activity.create({ data: { name, position }, select }));
  },

  async rename(id, name) {
    return toRecord(
      await prisma.activity.update({ where: { id: BigInt(id) }, data: { name }, select }),
    );
  },

  // Exclusão lógica: o histórico dos dias passados continua apontando para a atividade.
  async remove(id) {
    await prisma.$transaction(async (tx) => {
      await tx.activity.update({ where: { id: BigInt(id) }, data: { deletedAt: new Date() } });
      const remaining = await tx.activity.findMany({
        where: active,
        orderBy: [...byPosition],
        select: { id: true },
      });
      for (const [index, row] of remaining.entries()) {
        await tx.activity.update({ where: { id: row.id }, data: { position: index + 1 } });
      }
    });
  },

  async setOrder(ids) {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.activity.update({ where: { id: BigInt(id) }, data: { position: index + 1 } }),
      ),
    );
  },
};
