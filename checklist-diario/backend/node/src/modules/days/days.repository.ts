import { prisma } from '../../shared/database/prisma.js';
import type { DaysRepository } from './days.service.js';

const TZ = 'America/Sao_Paulo';

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);

type ActivityRow = { id: bigint; name: string };
type FirstDayRow = { day: string | null };
type SummaryRow = { day: string; done: bigint; total: bigint };

export const daysRepository: DaysRepository = {
  async activitiesOnDay(day) {
    const rows = await prisma.$queryRaw<ActivityRow[]>`
      SELECT id, name
      FROM activities
      WHERE (created_at AT TIME ZONE ${TZ})::date <= ${day}::date
        AND (deleted_at IS NULL OR (deleted_at AT TIME ZONE ${TZ})::date > ${day}::date)
      ORDER BY position, id`;
    return rows.map((row) => ({ id: Number(row.id), name: row.name }));
  },

  async checkedActivityIds(day) {
    const rows = await prisma.activityCheck.findMany({
      where: { day: toDate(day) },
      select: { activityId: true },
    });
    return rows.map((row) => Number(row.activityId));
  },

  async isActive(activityId) {
    const found = await prisma.activity.findFirst({
      where: { id: BigInt(activityId), deletedAt: null },
      select: { id: true },
    });
    return found !== null;
  },

  async addCheck(activityId, day) {
    await prisma.activityCheck.createMany({
      data: [{ activityId: BigInt(activityId), day: toDate(day) }],
      skipDuplicates: true,
    });
  },

  async removeCheck(activityId, day) {
    await prisma.activityCheck.deleteMany({
      where: { activityId: BigInt(activityId), day: toDate(day) },
    });
  },

  async firstDay() {
    const rows = await prisma.$queryRaw<FirstDayRow[]>`
      SELECT to_char(min((created_at AT TIME ZONE ${TZ})::date), 'YYYY-MM-DD') AS day
      FROM activities`;
    return rows[0]?.day ?? null;
  },

  async summaries(from, to) {
    const rows = await prisma.$queryRaw<SummaryRow[]>`
      SELECT
        to_char(d::date, 'YYYY-MM-DD') AS day,
        (
          SELECT count(*) FROM activities a
          WHERE (a.created_at AT TIME ZONE ${TZ})::date <= d::date
            AND (a.deleted_at IS NULL OR (a.deleted_at AT TIME ZONE ${TZ})::date > d::date)
        ) AS total,
        (SELECT count(*) FROM activity_checks c WHERE c.day = d::date) AS done
      FROM generate_series(${from}::date, ${to}::date, interval '1 day') AS d
      ORDER BY d`;
    return rows.map((row) => ({
      day: row.day,
      done: Number(row.done),
      total: Number(row.total),
    }));
  },
};
