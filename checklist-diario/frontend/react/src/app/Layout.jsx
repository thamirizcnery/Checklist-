import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Hoje", end: true },
  { to: "/atividades", label: "Atividades" },
  { to: "/historico", label: "Histórico" },
];

const linkClass = ({ isActive }) =>
  `inline-flex h-10 items-center rounded-button px-xxxs text-sm font-medium transition-colors duration-fast ${
    isActive ? "bg-primary-soft text-primary-hover" : "text-ink-secondary hover:bg-subtle"
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-nano px-xxxs py-nano">
          <p className="text-lg font-bold text-ink-strong">Checklist diário</p>
          <nav aria-label="Principal" className="flex gap-quark">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-xxxs py-xxs">
        <Outlet />
      </main>
    </div>
  );
}
