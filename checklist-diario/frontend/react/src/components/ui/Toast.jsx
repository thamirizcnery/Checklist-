import { CircleX, X } from "lucide-react";

/** Aviso do ADS. `tone="error"` é anunciado na hora por leitores de tela. */
export default function Toast({ tone = "info", message, actionLabel, onAction, onClose }) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className="fixed bottom-xxxs left-1/2 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-nano rounded-card border border-line bg-card px-xxxs py-nano shadow-floating"
    >
      {isError ? <CircleX aria-hidden="true" size={20} className="shrink-0 text-danger" /> : null}
      <p className="flex-1 text-sm text-ink">{message}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="h-8 rounded-button px-nano text-sm font-medium text-primary-hover hover:bg-primary-soft"
        >
          {actionLabel}
        </button>
      ) : null}
      {onClose ? (
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-button text-ink-secondary hover:bg-subtle"
        >
          <X aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}
