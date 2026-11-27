/** Estado vazio do ADS: título curto, uma frase de direção e uma ação. */
export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-nano rounded-card border border-line bg-card px-xxs py-xs text-center shadow-card">
      <h2 className="text-lg font-bold text-ink-strong">{title}</h2>
      {description ? <p className="max-w-sm text-base text-ink-secondary">{description}</p> : null}
      {action ? <div className="mt-nano">{action}</div> : null}
    </div>
  );
}
