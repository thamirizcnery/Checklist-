import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { dayInSaoPaulo } from '../../shared/clock/clock.js';

const seed = async () => {
  const a = await prisma.activity.create({ data: { name: 'Beber água', position: 1 } });
  const b = await prisma.activity.create({ data: { name: 'Caminhar', position: 2 } });
  return { a: Number(a.id), b: Number(b.id) };
};

describe('days routes (hoje)', () => {
  beforeEach(async () => {
    await prisma.activityCheck.deleteMany();
    await prisma.activity.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve mostrar hoje vazio quando não há atividades', async () => {
    const response = await request(app).get('/api/v1/days/today');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      date: dayInSaoPaulo(new Date()),
      done: 0,
      total: 0,
      activities: [],
    });
  });

  it('deve marcar, manter ao consultar de novo e desmarcar', async () => {
    const { a } = await seed();

    const marked = await request(app).put(`/api/v1/days/today/checks/${a}`);
    const fetched = await request(app).get('/api/v1/days/today');
    const unmarked = await request(app).delete(`/api/v1/days/today/checks/${a}`);

    expect(marked.status).toBe(200);
    expect(marked.body).toMatchObject({ done: 1, total: 2 });
    expect(fetched.body.activities).toEqual([
      { id: a, name: 'Beber água', done: true },
      expect.objectContaining({ name: 'Caminhar', done: false }),
    ]);
    expect(unmarked.body).toMatchObject({ done: 0, total: 2 });
  });

  it('deve ser idempotente ao marcar duas vezes', async () => {
    const { a } = await seed();

    await request(app).put(`/api/v1/days/today/checks/${a}`);
    const second = await request(app).put(`/api/v1/days/today/checks/${a}`);

    expect(second.status).toBe(200);
    expect(second.body.done).toBe(1);
    expect(await prisma.activityCheck.count()).toBe(1);
  });

  it('deve responder 404 ao marcar atividade inexistente ou removida', async () => {
    const { a } = await seed();
    await prisma.activity.update({ where: { id: BigInt(a) }, data: { deletedAt: new Date() } });

    const missing = await request(app).put('/api/v1/days/today/checks/999999');
    const removed = await request(app).put(`/api/v1/days/today/checks/${a}`);

    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('ACTIVITY_NOT_FOUND');
    expect(removed.status).toBe(404);
  });

  it('deve responder 400 quando o id ou a data são inválidos', async () => {
    const badId = await request(app).put('/api/v1/days/today/checks/abc');
    const badDate = await request(app).get('/api/v1/days/ontem');

    expect(badId.status).toBe(400);
    expect(badId.body.error.code).toBe('VALIDATION_ERROR');
    expect(badDate.status).toBe(400);
  });
});
