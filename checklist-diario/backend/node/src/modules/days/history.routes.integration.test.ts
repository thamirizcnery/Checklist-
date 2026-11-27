import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { addDays, dayInSaoPaulo } from '../../shared/clock/clock.js';

const today = () => dayInSaoPaulo(new Date());
const at = (day: string) => new Date(`${day}T15:00:00Z`);

describe('days routes (histórico)', () => {
  beforeEach(async () => {
    await prisma.activityCheck.deleteMany();
    await prisma.activity.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve listar os dias do primeiro uso até hoje, do mais recente ao mais antigo', async () => {
    const twoDaysAgo = addDays(today(), -2);
    const a = await prisma.activity.create({
      data: { name: 'A', position: 1, createdAt: at(twoDaysAgo) },
    });
    await prisma.activityCheck.create({ data: { activityId: a.id, day: new Date(twoDaysAgo) } });

    const response = await request(app).get('/api/v1/days');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { date: today(), done: 0, total: 1 },
        { date: addDays(today(), -1), done: 0, total: 1 },
        { date: twoDaysAgo, done: 1, total: 1 },
      ],
      page: 1,
      pageSize: 30,
      total: 3,
    });
  });

  it('deve paginar o histórico', async () => {
    await prisma.activity.create({
      data: { name: 'A', position: 1, createdAt: at(addDays(today(), -4)) },
    });

    const response = await request(app).get('/api/v1/days?page=2&pageSize=2');

    expect(response.body.total).toBe(5);
    expect(response.body.data.map((d: { date: string }) => d.date)).toEqual([
      addDays(today(), -2),
      addDays(today(), -3),
    ]);
  });

  it('deve manter no passado a atividade removida depois e deixar de fora a criada depois', async () => {
    const d3 = addDays(today(), -3);
    const d1 = addDays(today(), -1);
    const removedLater = await prisma.activity.create({
      data: { name: 'Removida', position: 1, createdAt: at(d3), deletedAt: at(d1) },
    });
    await prisma.activity.create({
      data: { name: 'Nova', position: 2, createdAt: at(d1) },
    });
    await prisma.activityCheck.create({
      data: { activityId: removedLater.id, day: new Date(d3) },
    });

    const past = await request(app).get(`/api/v1/days/${d3}`);
    const yesterday = await request(app).get(`/api/v1/days/${d1}`);

    expect(past.body).toEqual({
      date: d3,
      done: 1,
      total: 1,
      activities: [{ id: Number(removedLater.id), name: 'Removida', done: true }],
    });
    expect(yesterday.body.activities.map((a: { name: string }) => a.name)).toEqual(['Nova']);
  });

  it('deve responder 404 para dia futuro ou anterior ao primeiro uso', async () => {
    await prisma.activity.create({ data: { name: 'A', position: 1 } });

    const future = await request(app).get(`/api/v1/days/${addDays(today(), 1)}`);
    const before = await request(app).get(`/api/v1/days/${addDays(today(), -1)}`);

    expect(future.status).toBe(404);
    expect(future.body.error.code).toBe('DAY_NOT_FOUND');
    expect(before.status).toBe(404);
  });

  it('deve responder 400 para paginação inválida', async () => {
    const response = await request(app).get('/api/v1/days?pageSize=1000');

    expect(response.status).toBe(400);
  });
});
