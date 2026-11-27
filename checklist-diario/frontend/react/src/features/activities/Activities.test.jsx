import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Activities from "./Activities.jsx";

const A = { id: 1, name: "Beber água", position: 1 };
const B = { id: 2, name: "Caminhar", position: 2 };

const json = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const list = (data) => json({ data, page: 1, pageSize: 100, total: data.length });
const names = () => screen.getAllByRole("listitem").map((li) => li.textContent);

describe("Activities", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve convidar a adicionar quando a lista está vazia", async () => {
    fetch.mockReturnValueOnce(list([]));

    render(<Activities />);

    expect(await screen.findByText("Nenhuma atividade cadastrada")).toBeInTheDocument();
  });

  it("deve adicionar uma atividade ao fim da lista e limpar o campo", async () => {
    fetch
      .mockReturnValueOnce(list([A]))
      .mockReturnValueOnce(json({ id: 2, name: "Caminhar", position: 2 }, 201));

    render(<Activities />);
    await userEvent.type(await screen.findByLabelText("Nova atividade"), "  Caminhar ");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Caminhar")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/activities",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Caminhar" }) }),
    );
    expect(screen.getByLabelText("Nova atividade")).toHaveValue("");
  });

  it("deve explicar o erro quando o nome está em branco, sem chamar a API", async () => {
    fetch.mockReturnValueOnce(list([]));

    render(<Activities />);
    await userEvent.click(await screen.findByRole("button", { name: "Adicionar" }));

    expect(screen.getByLabelText("Nova atividade")).toHaveAccessibleDescription(
      "Informe o nome da atividade",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve avisar quando o nome passa de 120 caracteres", async () => {
    fetch.mockReturnValueOnce(list([]));

    render(<Activities />);
    await userEvent.type(await screen.findByLabelText("Nova atividade"), "a".repeat(121));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByLabelText("Nova atividade")).toHaveAccessibleDescription(
      "O nome pode ter até 120 caracteres",
    );
  });

  it("deve renomear uma atividade", async () => {
    fetch
      .mockReturnValueOnce(list([A, B]))
      .mockReturnValueOnce(json({ ...A, name: "Beber 2 litros" }));

    render(<Activities />);
    await userEvent.click(await screen.findByRole("button", { name: 'Editar "Beber água"' }));
    const field = screen.getByLabelText('Nome de "Beber água"');
    await userEvent.clear(field);
    await userEvent.type(field, "Beber 2 litros");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Beber 2 litros")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/activities/1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("deve mover por teclado e manter a nova ordem", async () => {
    fetch
      .mockReturnValueOnce(list([A, B]))
      .mockReturnValueOnce(json({ data: [{ ...B, position: 1 }, { ...A, position: 2 }] }));

    render(<Activities />);
    const down = await screen.findByRole("button", { name: 'Mover "Beber água" para baixo' });
    down.focus();
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(names()[0]).toContain("Caminhar"));
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/activities/order",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ ids: [2, 1] }) }),
    );
  });

  it("não deve permitir subir o primeiro nem descer o último", async () => {
    fetch.mockReturnValueOnce(list([A, B]));

    render(<Activities />);

    expect(await screen.findByRole("button", { name: 'Mover "Beber água" para cima' })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: 'Mover "Caminhar" para baixo' })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("deve voltar a ordem e avisar quando salvar a ordem falha", async () => {
    fetch.mockReturnValueOnce(list([A, B])).mockReturnValueOnce(json({ error: {} }, 500));

    render(<Activities />);
    await userEvent.click(await screen.findByRole("button", { name: 'Mover "Beber água" para baixo' }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível mudar a ordem.");
    expect(names()[0]).toContain("Beber água");
  });

  it("deve pedir confirmação antes de remover e só remover ao confirmar", async () => {
    fetch.mockReturnValueOnce(list([A, B])).mockReturnValueOnce(json(null, 204));

    render(<Activities />);
    await userEvent.click(await screen.findByRole("button", { name: 'Remover "Beber água"' }));

    const dialog = screen.getByRole("dialog", { name: "Remover atividade" });
    expect(dialog).toHaveTextContent("continua no histórico");
    expect(fetch).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Remover" }));

    await waitFor(() => expect(screen.queryByText("Beber água")).not.toBeInTheDocument());
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/v1/activities/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deve manter a atividade quando a pessoa cancela a remoção", async () => {
    fetch.mockReturnValueOnce(list([A]));

    render(<Activities />);
    await userEvent.click(await screen.findByRole("button", { name: 'Remover "Beber água"' }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Beber água")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
