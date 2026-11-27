import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { api } from "../../services/api.js";
import { formatDay } from "../../services/format.js";

const PAGE_SIZE = 30;

export default function History() {
  const [status, setStatus] = useState("loading");
  const [days, setDays] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);

  const loadFirst = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await api.listDays(1, PAGE_SIZE);
      setDays(result.data);
      setTotal(result.total);
      setPage(1);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreFailed(false);
    try {
      const result = await api.listDays(page + 1, PAGE_SIZE);
      setDays((current) => [...current, ...result.data]);
      setPage(page + 1);
    } catch {
      setMoreFailed(true);
    }
    setLoadingMore(false);
  };

  if (status === "loading") return <p className="text-ink-secondary">Carregando…</p>;

  if (status === "error") {
    return (
      <EmptyState
        title="Não foi possível carregar o histórico"
        description="Verifique a conexão e tente de novo."
        action={<Button onClick={loadFirst}>Tentar de novo</Button>}
      />
    );
  }

  const noActivityYet = days.length === 1 && days[0].total === 0;

  return (
    <section className="flex flex-col gap-xxs">
      <header className="flex flex-col gap-nano">
        <h1 className="text-2xl font-bold text-ink-strong">Histórico</h1>
        <p className="text-base text-ink-secondary">
          Veja quantas atividades você fez em cada dia.
        </p>
      </header>

      {noActivityYet ? (
        <EmptyState
          title="Ainda não há histórico"
          description="Cadastre atividades e marque o que fizer. Os dias aparecem aqui."
        />
      ) : (
        <ul className="divide-y divide-line rounded-card border border-line bg-card shadow-card">
          {days.map((day, index) => (
            <li key={day.date}>
              <Link
                to={`/historico/${day.date}`}
                className="flex min-h-14 items-center gap-nano px-xxxs py-nano hover:bg-subtle"
              >
                <span className="flex-1 text-base text-ink">
                  {formatDay(day.date)}
                  {index === 0 ? <span className="ml-nano text-sm text-ink-soft">Hoje</span> : null}
                </span>
                <span className="text-sm font-medium text-ink-secondary">
                  {day.done} de {day.total}
                </span>
                <ChevronRight aria-hidden="true" size={18} className="text-ink-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {days.length < total ? (
        <div className="flex flex-col items-start gap-nano">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            Ver dias anteriores
          </Button>
          {moreFailed ? (
            <p role="alert" className="text-sm text-danger">
              Não foi possível carregar mais dias.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
