import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Checkbox from "../../components/ui/Checkbox.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { formatDay } from "../../services/format.js";
import { useToday } from "./useToday.js";

function Progress({ done, total }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex flex-col gap-nano">
      <p className="text-sm font-medium text-ink-secondary">
        {done} de {total}
      </p>
      <div
        role="progressbar"
        aria-label="Progresso do dia"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${total} atividades feitas`}
        className="h-2 w-full overflow-hidden rounded-pill bg-subtle"
      >
        <div
          className="h-full rounded-pill bg-primary transition-all duration-base"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Today() {
  const { status, day, failure, toggle, retry, dismissFailure, reload } = useToday();

  if (status === "loading") {
    return <p className="text-ink-secondary">Carregando…</p>;
  }

  if (status === "error") {
    return (
      <EmptyState
        title="Não foi possível carregar o dia"
        description="Verifique a conexão e tente de novo."
        action={<Button onClick={reload}>Tentar de novo</Button>}
      />
    );
  }

  const finished = day.total > 0 && day.done === day.total;

  return (
    <section className="flex flex-col gap-xxs">
      <header className="flex flex-col gap-nano">
        <h1 className="text-2xl font-bold text-ink-strong">Hoje</h1>
        <p className="text-base text-ink-secondary">{formatDay(day.date)}</p>
      </header>

      {day.total === 0 ? (
        <EmptyState
          title="Nenhuma atividade cadastrada"
          description="Adicione as atividades que você faz todo dia para marcar aqui."
          action={
            <Link
              to="/atividades"
              className="inline-flex h-10 items-center rounded-button bg-primary px-xxxs text-sm font-medium text-ink-inverse hover:bg-primary-hover"
            >
              Adicionar atividade
            </Link>
          }
        />
      ) : (
        <>
          <Progress done={day.done} total={day.total} />

          {finished ? (
            <p
              role="status"
              className="rounded-card bg-primary-soft px-xxxs py-nano text-base font-medium text-primary-hover"
            >
              Dia concluído. Todas as atividades foram feitas.
            </p>
          ) : null}

          <ul className="divide-y divide-line rounded-card border border-line bg-card px-xxxs shadow-card">
            {day.activities.map((activity) => (
              <li key={activity.id}>
                <Checkbox
                  checked={activity.done}
                  onChange={(checked) => toggle(activity.id, checked)}
                  label={
                    <span className={activity.done ? "text-ink-soft line-through" : "text-ink"}>
                      {activity.name}
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {failure ? (
        <Toast
          tone="error"
          message="Não foi possível salvar a marcação."
          actionLabel="Tentar de novo"
          onAction={retry}
          onClose={dismissFailure}
        />
      ) : null}
    </section>
  );
}
