// Os valores vêm do design system Alquimia (ADS) e vivem em src/styles/tokens.css.
// Aqui só damos nomes de uso para o Tailwind, nunca valores soltos.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          pressed: "var(--color-primary-pressed)",
          soft: "var(--color-primary-soft)",
          disabled: "var(--color-primary-disabled)",
        },
        page: "var(--surface-page)",
        card: "var(--surface-card)",
        subtle: "var(--surface-subtle)",
        ink: {
          DEFAULT: "var(--text-default)",
          strong: "var(--text-strong)",
          secondary: "var(--text-secondary)",
          soft: "var(--text-soft)",
          inverse: "var(--text-inverse)",
        },
        line: {
          DEFAULT: "var(--border-subtle)",
          control: "var(--border-control)",
        },
        danger: "var(--text-danger)",
      },
      fontFamily: { sans: ["var(--font-sans)"] },
      borderRadius: {
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-0)",
        floating: "var(--shadow-2)",
        modal: "var(--shadow-3)",
      },
      spacing: {
        quark: "var(--space-quark)",
        nano: "var(--space-nano)",
        xxxs: "var(--space-xxxs)",
        xxs: "var(--space-xxs)",
        xs: "var(--space-xs)",
      },
      transitionDuration: { fast: "120ms", base: "180ms" },
    },
  },
  plugins: [],
};
