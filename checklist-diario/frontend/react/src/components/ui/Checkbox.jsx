import { useId } from "react";
import { Check } from "lucide-react";

/** Caixa de marcar do ADS: 20px, borda de 2px, marcada = azul sólido com check branco. */
export default function Checkbox({ checked, onChange, label, disabled = false, className = "" }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex min-h-10 cursor-pointer items-center gap-xxxs ${className}`}
    >
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer absolute inset-0 m-0 h-5 w-5 cursor-pointer appearance-none rounded-button border-2 border-line-control bg-card transition-colors duration-fast checked:border-primary checked:bg-primary"
        />
        <Check
          aria-hidden="true"
          size={14}
          strokeWidth={3}
          className="pointer-events-none absolute left-[3px] top-[3px] text-ink-inverse opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </label>
  );
}
