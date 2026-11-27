import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DayDetail from "./DayDetail.jsx";
import History from "./History.jsx";

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/historico" element={<History />} />
        <Route path="/historico/:date" element={<DayDetail />} />
      </Routes>
    </MemoryRouter>,
  );

describe("History", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve listar os dias com feitas de total, do mais recente ao mais antigo", async () => {
    fetch.mockReturnValueOnce(
      json({
        data: [
          { date: "2026-11-25", done: 1, total: 4 },
          { date: "2026-11-24", done: 0, total: 3 },
        ],
        page: 1,
        pageSize: 30,
        total: 2,
      }),
    );

    renderAt("/historico");

    const rows = await screen.findAllByRole("link");
    expect(rows[0]).toHaveTextContent("25/11/2026");
    expect(rows[0]).toHaveTextContent("1 de 4");
    expect(rows[1]).toHaveTextContent("24/11/2026");
    expect(rows[1]).toHaveTextContent("0 de 3");
    expect(rows[1]).toHaveAttribute("href", "/historico/2026-11-24");
    expect(screen.queryByRole("button", { name: "Ver dias anteriores" })).not.toBeInTheDocument();
  });

  it("deve carregar mais dias quando há outra página", async () => {
    fetch
      .mockReturnValueOnce(
        json({ data: [{ date: "2026-11-25", done: 1, total: 1 }], page: 1, pageSize: 30, total: 2 }),
      )
      .mockReturnValueOnce(
        json({ data: [{ date: "2026-11-24", done: 0, total: 1 }], page: 2, pageSize: 30, total: 2 }),
      );

    renderAt("/historico");
    await userEvent.click(await screen.findByRole("button", { name: "Ver dias anteriores" }));

    expect(await screen.findByText("24/11/2026")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith("/api/v1/days?page=2&pageSize=30", expect.anything());
    expect(screen.queryByRole("button", { name: "Ver dias anteriores" })).not.toBeInTheDocument();
  });

  it("deve explicar quando ainda não há atividades", async () => {
    fetch.mockReturnValueOnce(
      json({ data: [{ date: "2026-11-25", done: 0, total: 0 }], page: 1, pageSize: 30, total: 1 }),
    );

    renderAt("/historico");

    expect(await screen.findByText("Ainda não há histórico")).toBeInTheDocument();
  });

  it("deve mostrar feitas e pendentes no detalhe do dia", async () => {
    fetch.mockReturnValueOnce(
      json({
        date: "2026-11-24",
        done: 1,
        total: 3,
        activities: [
          { id: 1, name: "Beber água", done: true },
          { id: 2, name: "Caminhar", done: false },
          { id: 3, name: "Removida depois", done: false },
        ],
      }),
    );

    renderAt("/historico/2026-11-24");

    expect(await screen.findByRole("heading", { name: "24/11/2026" })).toBeInTheDocument();
    expect(screen.getByText("1 de 3 atividades feitas")).toBeInTheDocument();
    const feitas = screen.getByRole("region", { name: "Feitas" });
    const pendentes = screen.getByRole("region", { name: "Pendentes" });
    expect(within(feitas).getByText("Beber água")).toBeInTheDocument();
    expect(within(pendentes).getByText("Caminhar")).toBeInTheDocument();
    expect(within(pendentes).getByText("Removida depois")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao histórico" })).toHaveAttribute(
      "href",
      "/historico",
    );
  });

  it("deve avisar quando o dia não existe", async () => {
    fetch.mockReturnValueOnce(json({ error: { code: "DAY_NOT_FOUND", message: "Dia não encontrado" } }, 404));

    renderAt("/historico/2020-01-01");

    expect(await screen.findByText("Dia não encontrado")).toBeInTheDocument();
  });

  it("deve oferecer nova tentativa quando o histórico não carrega", async () => {
    fetch
      .mockRejectedValueOnce(new Error("offline"))
      .mockReturnValueOnce(
        json({ data: [{ date: "2026-11-25", done: 1, total: 2 }], page: 1, pageSize: 30, total: 1 }),
      );

    renderAt("/historico");
    await userEvent.click(await screen.findByRole("button", { name: "Tentar de novo" }));

    await waitFor(() => expect(screen.getByText("1 de 2")).toBeInTheDocument());
  });
});
