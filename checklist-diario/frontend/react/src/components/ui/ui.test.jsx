import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button.jsx";
import Checkbox from "./Checkbox.jsx";
import EmptyState from "./EmptyState.jsx";
import Input from "./Input.jsx";
import Modal from "./Modal.jsx";
import Toast from "./Toast.jsx";

describe("Checkbox", () => {
  it("deve marcar com o teclado (espaço) e ter nome acessível", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Beber água" />);

    await userEvent.tab();
    expect(screen.getByRole("checkbox", { name: "Beber água" })).toHaveFocus();
    await userEvent.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Input", () => {
  it("deve ligar rótulo e mensagem de erro ao campo", () => {
    render(<Input label="Nome da atividade" error="Informe um nome" />);

    const field = screen.getByLabelText("Nome da atividade");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Informe um nome");
  });
});

describe("Modal", () => {
  it("deve fechar com Esc e levar o foco para dentro", async () => {
    const onClose = vi.fn();
    render(
      <Modal
        title="Remover atividade"
        onClose={onClose}
        actions={<Button onClick={onClose}>Cancelar</Button>}
      >
        Texto
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Remover atividade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});

describe("Toast", () => {
  it("deve anunciar erro como alerta e oferecer a ação", async () => {
    const onAction = vi.fn();
    render(<Toast tone="error" message="Não foi possível salvar" actionLabel="Tentar de novo" onAction={onAction} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível salvar");
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onAction).toHaveBeenCalled();
  });
});

describe("Button e EmptyState", () => {
  it("deve respeitar disabled e mostrar a ação do estado vazio", () => {
    render(
      <EmptyState
        title="Nenhuma atividade cadastrada"
        description="Adicione a primeira."
        action={<Button disabled>Adicionar atividade</Button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Nenhuma atividade cadastrada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar atividade" })).toBeDisabled();
  });
});
