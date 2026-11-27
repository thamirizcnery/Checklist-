const base =
  "inline-flex items-center justify-center gap-nano rounded-button font-medium transition-colors duration-fast disabled:cursor-not-allowed";

const variants = {
  filled:
    "bg-primary text-ink-inverse hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-disabled",
  secondary: "bg-primary-soft text-primary-hover hover:bg-primary-disabled/40 disabled:opacity-60",
  unfilled: "bg-transparent text-primary-hover hover:bg-primary-soft disabled:opacity-60",
  outline:
    "border border-primary bg-transparent text-primary-hover hover:bg-primary-soft disabled:opacity-60",
  danger: "bg-danger text-ink-inverse hover:opacity-90 disabled:opacity-60",
};

const sizes = {
  medium: "h-10 px-xxxs text-sm",
  small: "h-8 px-nano text-sm",
};

/** Botão do ADS. Rótulos curtos, com verbo ("Aplicar", "Cancelar"). Só ícone exige aria-label. */
export default function Button({
  variant = "filled",
  size = "medium",
  iconOnly = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const shape = iconOnly ? (size === "small" ? "w-8 px-0" : "w-10 px-0") : "";
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${shape} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
