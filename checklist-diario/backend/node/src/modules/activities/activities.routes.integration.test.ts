import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';

const create = async (name: string) => {
  const response = await request(app).post('/api/v1/activities').send({ name });
  return response.body as { id: number; name: string; position: number };
};

describe('activities routes', () => {
  beforeEach(async () => {
    await prisma.activityCheck.deleteMany();
    await prisma.activity.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve criar no fim da lista e aparar espaços do nome', async () => {
    await create('Beber água');
    const response = await request(app).post('/api/v1/activities').send({ name: '  Caminhar ' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Caminhar', position: 2 });
  });

  it('deve responder 400 para nome em branco, longo demais ou campo extra', async () => {
    const blank = await request(app).post('/api/v1/activities').send({ name: '   ' });
    const long = await request(app)
      .post('/api/v1/activities')
      .send({ name: 'a'.repeat(121) });
    const extra = await request(app).post('/api/v1/activities').send({ name: 'ok', cor: 'azul' });

    for (const response of [blank, long, extra]) {
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    }
    expect(blank.body.error.details[0].message).toBe('Informe o nome da atividade');
  });

  it('deve listar por posição com paginação', async () => {
    await create('A');
    await create('B');
    await create('C');

    const response = await request(app).get('/api/v1/activities?page=2&pageSize=2');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ page: 2, pageSize: 2, total: 3 });
    expect(response.body.data.map((a: { name: string }) => a.name)).toEqual(['C']);
  });

  it('deve renomear mantendo se estava feita hoje', async () => {
    const a = await create('Ler');
    await request(app).put(`/api/v1/days/today/checks/${a.id}`);

    const renamed = await request(app)
      .patch(`/api/v1/activities/${a.id}`)
      .send({ name: 'Ler e-mails' });
    const today = await request(app).get('/api/v1/days/today');

    expect(renamed.status).toBe(200);
    expect(renamed.body.name).toBe('Ler e-mails');
    expect(today.body.activities).toEqual([{ id: a.id, name: 'Ler e-mails', done: true }]);
  });

  it('deve mudar a ordem e manter ao consultar de novo', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');

    const reordered = await request(app)
      .put('/api/v1/activities/order')
      .send({ ids: [c.id, a.id, b.id] });
    const listed = await request(app).get('/api/v1/activities');

    expect(reordered.status).toBe(200);
    expect(reordered.body.data.map((x: { name: string }) => x.name)).toEqual(['C', 'A', 'B']);
    expect(listed.body.data.map((x: { position: number }) => x.position)).toEqual([1, 2, 3]);
  });

  it('deve recusar ordem com ids faltando', async () => {
    const a = await create('A');
    await create('B');

    const response = await request(app)
      .put('/api/v1/activities/order')
      .send({ ids: [a.id] });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('deve remover sem apagar o histórico e recompactar as posições', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');
    await request(app).put(`/api/v1/days/today/checks/${b.id}`);

    const removed = await request(app).delete(`/api/v1/activities/${b.id}`);
    const listed = await request(app).get('/api/v1/activities');
    const again = await request(app).delete(`/api/v1/activities/${b.id}`);

    expect(removed.status).toBe(204);
    expect(listed.body.data).toEqual([
      { id: a.id, name: 'A', position: 1 },
      { id: c.id, name: 'C', position: 2 },
    ]);
    expect(again.status).toBe(404);
    expect(await prisma.activityCheck.count()).toBe(1);
    expect(await prisma.activity.count()).toBe(3);
  });

  it('deve responder 404 ao renomear atividade inexistente', async () => {
    const response = await request(app).patch('/api/v1/activities/999').send({ name: 'X' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ACTIVITY_NOT_FOUND');
  });
});
