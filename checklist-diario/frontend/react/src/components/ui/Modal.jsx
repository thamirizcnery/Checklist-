import { useEffect, useId, useRef } from "react";

/** Janela de confirmação do ADS: fundo escuro, cartão de 8px, Esc fecha, foco entra e volta. */
export default function Modal({ title, children, actions, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const focusable = panelRef.current?.querySelector("button, input, [href]");
    focusable?.focus();
    return () => previous?.focus?.();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose?.();
      return;
    }
    if (event.key !== "Tab") return;
    const items = panelRef.current?.querySelectorAll("button:not([disabled]), input, [href]");
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-xxxs"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-card bg-card p-xxs shadow-modal"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink-strong">
          {title}
        </h2>
        <div className="mt-nano text-base text-ink-secondary">{children}</div>
        <div className="mt-xxs flex justify-end gap-nano">{actions}</div>
      </div>
    </div>
  );
}
