import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { useActivities } from "./useActivities.js";

const MAX_NAME_LENGTH = 120;

/** Mesma regra da API, para avisar antes de enviar. */
function validateName(value) {
  const name = value.trim();
  if (name.length === 0) return "Informe o nome da atividade";
  if (name.length > MAX_NAME_LENGTH) return `O nome pode ter até ${MAX_NAME_LENGTH} caracteres`;
  return null;
}

function NewActivityForm({ onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const problem = validateName(name);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    const failure = await onCreate(name.trim());
    setSaving(false);
    if (failure) {
      setError(failure);
    } else {
      setName("");
      setError(null);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-nano sm:flex-row sm:items-start">
      <Input
        label="Nova atividade"
        placeholder="Ex.: Beber 2 litros de água"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError(null);
        }}
        className="flex-1"
      />
      <Button type="submit" disabled={saving} className="sm:mt-6">
        Adicionar
      </Button>
    </form>
  );
}

function EditRow({ item, onSave, onCancel }) {
  const [name, setName] = useState(item.name);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    const problem = validateName(name);
    if (problem) {
      setError(problem);
      return;
    }
    const failure = await onSave(item.id, name.trim());
    if (failure) setError(failure);
    else onCancel();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-nano py-nano sm:flex-row sm:items-start">
      <Input
        label={`Nome de "${item.name}"`}
        value={name}
        error={error}
        autoFocus
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError(null);
        }}
        className="flex-1"
      />
      <div className="flex gap-nano sm:mt-6">
        <Button type="submit">Salvar</Button>
        <Button variant="unfilled" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function RowButton({ label, disabled, onClick, children }) {
  // aria-disabled (e não disabled) mantém o foco no botão quando a atividade chega à ponta da lista.
  return (
    <Button
      variant="unfilled"
      iconOnly
      aria-label={label}
      aria-disabled={disabled ? "true" : undefined}
      className={disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      {children}
    </Button>
  );
}

export default function Activities() {
  const { status, items, failure, dismissFailure, reload, create, rename, remove, move } =
    useActivities();
  const [editingId, setEditingId] = useState(null);
  const [removing, setRemoving] = useState(null);

  if (status === "loading") return <p className="text-ink-secondary">Carregando…</p>;

  if (status === "error") {
    return (
      <EmptyState
        title="Não foi possível carregar as atividades"
        description="Verifique a conexão e tente de novo."
        action={<Button onClick={reload}>Tentar de novo</Button>}
      />
    );
  }

  const confirmRemove = async () => {
    const target = removing;
    setRemoving(null);
    await remove(target.id);
  };

  return (
    <section className="flex flex-col gap-xxs">
      <header className="flex flex-col gap-nano">
        <h1 className="text-2xl font-bold text-ink-strong">Atividades</h1>
        <p className="text-base text-ink-secondary">
          Estas atividades se repetem todos os dias.
        </p>
      </header>

      <NewActivityForm onCreate={create} />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade cadastrada"
          description="Adicione a primeira atividade acima."
        />
      ) : (
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-xxxs shadow-card">
          {items.map((item, index) => (
            <li key={item.id}>
              {editingId === item.id ? (
                <EditRow item={item} onSave={rename} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex items-center gap-nano py-nano">
                  <p className="min-w-0 flex-1 break-words text-base text-ink">{item.name}</p>
                  <RowButton
                    label={`Mover "${item.name}" para cima`}
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    <ArrowUp aria-hidden="true" size={18} />
                  </RowButton>
                  <RowButton
                    label={`Mover "${item.name}" para baixo`}
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    <ArrowDown aria-hidden="true" size={18} />
                  </RowButton>
                  <RowButton label={`Editar "${item.name}"`} onClick={() => setEditingId(item.id)}>
                    <Pencil aria-hidden="true" size={18} />
                  </RowButton>
                  <RowButton label={`Remover "${item.name}"`} onClick={() => setRemoving(item)}>
                    <Trash2 aria-hidden="true" size={18} />
                  </RowButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {removing ? (
        <Modal
          title="Remover atividade"
          onClose={() => setRemoving(null)}
          actions={
            <>
              <Button variant="unfilled" onClick={() => setRemoving(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmRemove}>
                Remover
              </Button>
            </>
          }
        >
          Remover "{removing.name}"? Ela sai da lista de hoje, mas continua no histórico dos dias em
          que foi feita.
        </Modal>
      ) : null}

      {failure ? <Toast tone="error" message={failure} onClose={dismissFailure} /> : null}
    </section>
  );
}
