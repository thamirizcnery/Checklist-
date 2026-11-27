import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Today from "./Today.jsx";

const dayWith = (activities) => ({
  date: "2026-11-25",
  done: activities.filter((a) => a.done).length,
  total: activities.length,
  activities,
});

const A = { id: 1, name: "Beber água", done: false };
const B = { id: 2, name: "Caminhar", done: false };

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

const renderToday = () =>
  render(
    <MemoryRouter>
      <Today />
    </MemoryRouter>,
  );

describe("Today", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve mostrar a data em dd/mm/aaaa, as atividades e o progresso", async () => {
    fetch.mockReturnValueOnce(json(dayWith([A, { ...B, done: true }])));

    renderToday();

    expect(await screen.findByText("25/11/2026")).toBeInTheDocument();
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Caminhar" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Beber água" })).not.toBeChecked();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });

  it("deve marcar e desmarcar, atualizando o progresso", async () => {
    fetch
      .mockReturnValueOnce(json(dayWith([A, B])))
      .mockReturnValueOnce(json(dayWith([{ ...A, done: true }, B])))
      .mockReturnValueOnce(json(dayWith([A, B])));

    renderToday();
    const box = await screen.findByRole("checkbox", { name: "Beber água" });

    await userEvent.click(box);
    await waitFor(() => expect(screen.getByText("1 de 2")).toBeInTheDocument());
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/days/today/checks/1",
      expect.objectContaining({ method: "PUT" }),
    );

    await userEvent.click(box);
    await waitFor(() => expect(screen.getByText("0 de 2")).toBeInTheDocument());
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/days/today/checks/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deve mostrar a mensagem de dia concluído quando tudo estiver feito", async () => {
    fetch.mockReturnValueOnce(json(dayWith([{ ...A, done: true }, { ...B, done: true }])));

    renderToday();

    expect(await screen.findByText(/Dia concluído/)).toBeInTheDocument();
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
  });

  it("deve convidar a adicionar a primeira atividade quando a lista está vazia", async () => {
    fetch.mockReturnValueOnce(json(dayWith([])));

    renderToday();

    expect(await screen.findByText("Nenhuma atividade cadastrada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar atividade" })).toHaveAttribute(
      "href",
      "/atividades",
    );
  });

  it("deve voltar atrás, avisar e permitir tentar de novo quando salvar falha", async () => {
    fetch
      .mockReturnValueOnce(json(dayWith([A, B])))
      .mockReturnValueOnce(json({ error: { message: "Erro interno" } }, 500))
      .mockReturnValueOnce(json(dayWith([{ ...A, done: true }, B])));

    renderToday();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Beber água" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível salvar a marcação.");
    expect(screen.getByRole("checkbox", { name: "Beber água" })).not.toBeChecked();
    expect(screen.getByText("0 de 2")).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole("button", { name: "Tentar de novo" }));
    await waitFor(() => expect(screen.getByText("1 de 2")).toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve oferecer nova tentativa quando não consegue carregar o dia", async () => {
    fetch.mockRejectedValueOnce(new Error("offline")).mockReturnValueOnce(json(dayWith([A])));

    renderToday();
    await userEvent.click(await screen.findByRole("button", { name: "Tentar de novo" }));

    expect(await screen.findByText("0 de 1")).toBeInTheDocument();
  });
});
