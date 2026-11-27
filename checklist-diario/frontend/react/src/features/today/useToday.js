import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api.js";

const recount = (day, activities) => ({
  ...day,
  activities,
  done: activities.filter((a) => a.done).length,
});

/** Estado do dia de hoje. Marcar é imediato na tela; se a API falhar, volta atrás e avisa. */
export function useToday() {
  const [status, setStatus] = useState("loading");
  const [day, setDay] = useState(null);
  const [failure, setFailure] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setDay(await api.getToday());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (activityId, done) => {
      if (!day) return;
      const before = day;
      setFailure(null);
      setDay((current) =>
        recount(
          current,
          current.activities.map((a) => (a.id === activityId ? { ...a, done } : a)),
        ),
      );
      try {
        setDay(await (done ? api.check(activityId) : api.uncheck(activityId)));
      } catch {
        setDay(before);
        setFailure({ activityId, done });
      }
    },
    [day],
  );

  const retry = useCallback(() => {
    if (failure) toggle(failure.activityId, failure.done);
  }, [failure, toggle]);

  return { status, day, failure, toggle, retry, dismissFailure: () => setFailure(null), reload: load };
}
