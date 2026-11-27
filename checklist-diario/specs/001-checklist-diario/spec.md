# Feature Specification: Checklist de atividades diárias

**Feature Branch**: `001-checklist-diario`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "cria uma aplicação de checklist das minhas atividades diárias"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar o que já fiz hoje (Priority: P1)

Ao abrir a aplicação, a pessoa vê a lista das suas atividades do dia e marca cada uma como feita, conforme avança. A lista começa limpa a cada novo dia.

**Why this priority**: É o uso central: saber, num relance, o que falta fazer hoje.

**Independent Test**: Com atividades já cadastradas, abrir a tela, marcar duas como feitas e recarregar a página: as duas continuam marcadas e o progresso mostra "2 de N".

**Acceptance Scenarios**:

1. **Given** uma lista com 5 atividades, **When** a pessoa marca uma como feita, **Then** ela aparece como concluída e o progresso do dia passa a "1 de 5".
2. **Given** uma atividade marcada como feita, **When** a pessoa desmarca, **Then** ela volta a pendente e o progresso se ajusta.
3. **Given** atividades marcadas ontem, **When** a pessoa abre a aplicação hoje, **Then** todas aparecem pendentes.
4. **Given** todas as atividades marcadas, **When** o progresso chega a "N de N", **Then** a tela mostra uma mensagem de dia concluído.

---

### User Story 2 - Montar e ajustar a minha lista (Priority: P2)

A pessoa cadastra suas atividades diárias, corrige o nome, muda a ordem e remove as que não faz mais.

**Why this priority**: Sem atividades cadastradas não há o que marcar, mas a lista muda pouco depois de montada.

**Independent Test**: Adicionar "Ler e-mails", renomear para "Ler e-mails da manhã", mover para o topo e remover: cada passo aparece na lista imediatamente.

**Acceptance Scenarios**:

1. **Given** uma lista vazia, **When** a pessoa adiciona "Beber água", **Then** a atividade aparece como pendente hoje.
2. **Given** uma atividade existente, **When** a pessoa edita o nome, **Then** o novo nome aparece, mantendo se estava feita ou não.
3. **Given** várias atividades, **When** a pessoa muda a ordem, **Then** a nova ordem é mantida ao reabrir.
4. **Given** uma atividade, **When** a pessoa a remove e confirma, **Then** ela some da lista de hoje, mas continua no histórico dos dias em que foi feita.

---

### User Story 3 - Ver como foram meus dias anteriores (Priority: P3)

A pessoa consulta os dias passados e vê quantas atividades fez em cada um.

**Why this priority**: Ajuda a criar constância, mas o checklist já é útil sem isso.

**Independent Test**: Depois de usar por dois dias, abrir o histórico e ver os dois dias com "feitas de total".

**Acceptance Scenarios**:

1. **Given** dias anteriores com atividades marcadas, **When** a pessoa abre o histórico, **Then** vê cada dia com o número de atividades feitas e o total.
2. **Given** um dia no histórico, **When** a pessoa o abre, **Then** vê quais atividades foram feitas e quais ficaram pendentes.

---

### Edge Cases

- Nome em branco ou só com espaços: a atividade não é criada e a tela explica o motivo.
- Nome repetido: a atividade é aceita (a pessoa pode ter duas "Caminhar").
- Nome muito longo: limitado a 120 caracteres, com aviso.
- Lista vazia: a tela convida a adicionar a primeira atividade.
- Virada do dia com a aplicação aberta: ao voltar à tela, a lista já mostra o novo dia.
- Dia sem uso: aparece no histórico como "0 de N", sem erro.
- Falha ao salvar: a tela avisa que a marcação não foi guardada e permite tentar de novo, sem perder o que a pessoa fez.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A pessoa MUST poder cadastrar uma atividade informando só o nome.
- **FR-002**: A pessoa MUST poder editar o nome e remover uma atividade, com confirmação antes de remover.
- **FR-003**: A pessoa MUST poder mudar a ordem das atividades.
- **FR-004**: A tela inicial MUST mostrar as atividades de hoje, cada uma pendente ou feita, e permitir marcar e desmarcar.
- **FR-005**: A tela MUST mostrar o progresso do dia ("X de N") e uma mensagem quando tudo estiver feito.
- **FR-006**: Todas as atividades MUST valer para todos os dias; a cada novo dia, todas começam pendentes.
- **FR-007**: As marcações MUST ficar guardadas e continuar ali ao fechar e reabrir a aplicação.
- **FR-008**: O sistema MUST guardar o resultado de cada dia (quais atividades foram feitas), e a pessoa MUST poder consultar os dias anteriores.
- **FR-009**: Remover uma atividade MUST preservar o histórico dos dias passados em que ela existiu.
- **FR-010**: A aplicação MUST ser em português do Brasil, com datas no formato dd/mm/aaaa, e seguir o design system Alquimia (ADS) da Farmarcas.
- **FR-011**: A aplicação MUST ser usável no computador e no celular, e navegável pelo teclado.

### Key Entities *(include if feature involves data)*

- **Atividade**: algo que a pessoa quer fazer todo dia. Tem nome e posição na lista; pode ser removida.
- **Registro do dia**: a marcação de que uma atividade foi feita em uma data específica. Liga uma atividade a um dia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A pessoa cadastra uma atividade e a marca como feita em menos de 15 segundos.
- **SC-002**: A pessoa vê o que falta fazer hoje em até 2 segundos após abrir a aplicação.
- **SC-003**: 100% das marcações feitas continuam ali depois de fechar e reabrir.
- **SC-004**: Numa primeira visita, a pessoa monta uma lista de 5 atividades e marca todas em menos de 2 minutos, sem ajuda.
- **SC-005**: A cada novo dia, 100% das atividades aparecem pendentes, e o dia anterior fica consultável no histórico.

## Assumptions

- Quem usa: uma única pessoa, para uso pessoal. Por isso não há cadastro nem login nesta primeira versão. Decision: sem login. Why: é o menor pedaço que funciona (MVP) e o pedido é de uso pessoal.
- "Diárias" significa que todas as atividades se repetem todos os dias. Atividades só de certos dias da semana, horários e lembretes ficam fora desta versão.
- O dia muda à meia-noite, no horário de Brasília.
- Fora desta versão: notificações, categorias, metas, compartilhar a lista, gráficos e exportação.
- Decision: segue a stack padrão do projeto (React na tela, API em Node, banco PostgreSQL) e roda em Docker. Why: é o padrão da constituição e os dados não somem ao reiniciar o computador.
- Decision: tela baseada no design system Alquimia (ADS) da Farmarcas, conforme pedido. Why: manter o visual e o texto do ADS (azul de ação, fonte Inter, botões com verbos curtos).
