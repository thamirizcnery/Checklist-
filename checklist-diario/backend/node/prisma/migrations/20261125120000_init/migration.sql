-- PK: bigint identity (decisão em prisma/schema.prisma e specs/001-checklist-diario/research.md).
-- CreateTable
CREATE TABLE "activities" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_checks" (
    "id" BIGSERIAL NOT NULL,
    "activity_id" BIGINT NOT NULL,
    "day" DATE NOT NULL,
    "checked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_checks_pkey" PRIMARY KEY ("id")
);

-- Marcar duas vezes o mesmo dia não duplica.
-- CreateIndex
CREATE UNIQUE INDEX "activity_checks_activity_id_day_key" ON "activity_checks"("activity_id", "day");

-- Ordem da lista só entre atividades ativas (exclusão lógica). Índice parcial: escrito à mão.
CREATE INDEX "activities_position_active_idx" ON "activities"("position") WHERE "deleted_at" IS NULL;

-- Histórico por dia.
CREATE INDEX "activity_checks_day_idx" ON "activity_checks"("day");

-- AddForeignKey (sem cascata: remover atividade é exclusão lógica)
ALTER TABLE "activity_checks" ADD CONSTRAINT "activity_checks_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
