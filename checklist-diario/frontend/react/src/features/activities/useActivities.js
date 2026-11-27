import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api.js";

/** Lista de atividades e as ações de cadastrar, renomear, mover e remover. */
export function useActivities() {
  const [status, setStatus] = useState("loading");
  const [items, setItems] = useState([]);
  const [failure, setFailure] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await api.listActivities();
      setItems(result.data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fail = (message) => setFailure(message);

  /** Devolve null se deu certo, ou a mensagem de erro para o formulário mostrar. */
  const create = useCallback(async (name) => {
    try {
      const created = await api.createActivity(name);
      setItems((current) => [...current, created]);
      return null;
    } catch (error) {
      return error.status === 400 ? error.message : "Não foi possível adicionar a atividade.";
    }
  }, []);

  const rename = useCallback(async (id, name) => {
    try {
      const updated = await api.renameActivity(id, name);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      return null;
    } catch (error) {
      return error.status === 400 ? error.message : "Não foi possível salvar o nome.";
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await api.removeActivity(id);
      setItems((current) => current.filter((item) => item.id !== id));
      return true;
    } catch {
      setFailure("Não foi possível remover a atividade.");
      return false;
    }
  }, []);

  const move = useCallback(
    async (id, direction) => {
      const from = items.findIndex((item) => item.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= items.length) return;

      const before = items;
      const next = [...items];
      [next[from], next[to]] = [next[to], next[from]];
      setItems(next);
      try {
        const result = await api.reorderActivities(next.map((item) => item.id));
        setItems(result.data);
      } catch {
        setItems(before);
        fail("Não foi possível mudar a ordem.");
      }
    },
    [items],
  );

  return {
    status,
    items,
    failure,
    dismissFailure: () => setFailure(null),
    reload: load,
    create,
    rename,
    remove,
    move,
  };
}
