import { useId } from "react";

/** Campo de texto do ADS com rótulo, ajuda e erro. O foco troca a borda de 1px por 2px azul. */
export default function Input({ label, error, hint, className = "", ...props }) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;
  return (
    <div className={`flex flex-col gap-quark ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink-strong">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`h-12 rounded-input border bg-card px-xxxs text-base text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 ${
          error
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-line-control focus:border-primary focus:ring-primary"
        }`}
        {...props}
      />
      {message ? (
        <p id={messageId} className={`text-sm ${error ? "text-danger" : "text-ink-soft"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
