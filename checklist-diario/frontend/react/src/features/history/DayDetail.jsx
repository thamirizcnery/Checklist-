import { ArrowLeft, Check, Circle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { api } from "../../services/api.js";
import { formatDay } from "../../services/format.js";

function Group({ title, icon: Icon, items, tone }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-nano">
      <h2 className="text-lg font-bold text-ink-strong">
        {title} <span className="text-sm font-medium text-ink-secondary">({items.length})</span>
      </h2>
      <ul className="divide-y divide-line rounded-card border border-line bg-card px-xxxs shadow-card">
        {items.map((item) => (
          <li key={item.id} className="flex min-h-12 items-center gap-nano py-nano">
            <Icon aria-hidden="true" size={18} className={tone} />
            <span className="text-base text-ink">{item.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DayDetail() {
  const { date } = useParams();
  const [status, setStatus] = useState("loading");
  const [day, setDay] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setDay(await api.getDay(date));
      setStatus("ready");
    } catch (error) {
      setStatus(error.status === 404 || error.status === 400 ? "missing" : "error");
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const back = (
    <Link
      to="/historico"
      className="inline-flex h-10 items-center gap-nano rounded-button text-sm font-medium text-primary-hover hover:underline"
    >
      <ArrowLeft aria-hidden="true" size={16} />
      Voltar ao histórico
    </Link>
  );

  if (status === "loading") return <p className="text-ink-secondary">Carregando…</p>;

  if (status === "missing") {
    return (
      <EmptyState
        title="Dia não encontrado"
        description="Não há registro para esta data."
        action={back}
      />
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        title="Não foi possível carregar o dia"
        description="Verifique a conexão e tente de novo."
        action={<Button onClick={load}>Tentar de novo</Button>}
      />
    );
  }

  const done = day.activities.filter((a) => a.done);
  const pending = day.activities.filter((a) => !a.done);

  return (
    <section className="flex flex-col gap-xxs">
      {back}
      <header className="flex flex-col gap-nano">
        <h1 className="text-2xl font-bold text-ink-strong">{formatDay(day.date)}</h1>
        <p className="text-base text-ink-secondary">
          {day.done} de {day.total} atividades feitas
        </p>
      </header>

      {day.total === 0 ? (
        <p className="text-base text-ink-secondary">Nenhuma atividade neste dia.</p>
      ) : null}
      <Group title="Feitas" icon={Check} items={done} tone="text-primary" />
      <Group title="Pendentes" icon={Circle} items={pending} tone="text-ink-secondary" />
    </section>
  );
}
