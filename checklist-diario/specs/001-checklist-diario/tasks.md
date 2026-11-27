---

description: "Lista de tarefas do checklist de atividades diárias"
---

# Tasks: Checklist de atividades diárias

**Input**: `/specs/001-checklist-diario/` (plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md)

**Tests**: incluídos (BACKEND.md exige teste antes do código e entrega com tudo verde). Escreva o teste, veja falhar, depois implemente.

**Caminhos**: API em `backend/node/`, tela em `frontend/react/`, a partir de `checklist-diario/`.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1, US2 ou US3

---

## Phase 1: Setup

- [x] T001 Copiar do Golden Path para `checklist-diario/`: `docker-compose.yml`, `.env.example`, `.gitignore`, `backend/node/` e `frontend/react/` (sem `skills/` nem exemplos), e criar `.env` a partir do `.env.example`
- [x] T002 Remover o módulo de exemplo `users` de `backend/node/src/modules/users/` e do `backend/node/src/app.ts`
- [x] T003 [P] Adicionar Tailwind CSS, `lucide-react` e Vitest + Testing Library em `frontend/react/package.json`; configurar Tailwind e o script de teste
- [x] T004 [P] Criar `README.md` curto na raiz explicando como subir e acessar (`docker compose up -d --build --wait`)
- [x] T005 Subir o ambiente e confirmar que `postgres`, `api` e `web` ficam saudáveis antes de mexer no código

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [x] T006 Modelar `Activity` e `ActivityCheck` em `backend/node/prisma/schema.prisma` conforme `data-model.md` (PK bigint, `@db.Timestamptz(3)`, `@db.Date`)
- [x] T007 Gerar a migration inicial com `--create-only` em `backend/node/prisma/migrations/` e editar o SQL: índice parcial de posição (`WHERE deleted_at IS NULL`) e unicidade `(activity_id, day)`; aplicar
- [x] T008 [P] Teste e implementação do relógio de Brasília (hoje em `America/Sao_Paulo`, virada 23:59 → 00:00) em `backend/node/src/shared/clock/clock.ts` e `clock.test.ts`
- [x] T009 [P] Ajustar o tratamento de erros em `backend/node/src/shared/errors/` para os códigos `VALIDATION_ERROR`, `NOT_FOUND` e `CONFLICT` com mensagens em português
- [x] T010 [P] Tokens do Alquimia no Tailwind em `frontend/react/src/styles/` (cores, Inter, raios 4/6/8px, escala de espaço) e fonte Inter servida pela própria aplicação
- [x] T011 [P] Componentes base do ADS em `frontend/react/src/components/ui/`: `Button`, `Input`, `Checkbox`, `Modal`, `Toast`, `EmptyState`, com teste de acessibilidade básico (rótulo, foco, teclado)
- [x] T012 [P] Cliente da API e tratamento de erro em `frontend/react/src/services/api.js`
- [x] T013 Layout com barra superior e três rotas (Hoje, Atividades, Histórico) em `frontend/react/src/app/`

**Checkpoint**: banco migrado, erros padronizados, tokens e componentes prontos.

---

## Phase 3: User Story 1 — Marcar o que já fiz hoje (P1) 🎯 MVP

**Goal**: ver as atividades de hoje, marcar e desmarcar, ver o progresso e a mensagem de dia concluído.

**Independent Test**: com atividades criadas por seed, marcar duas, recarregar e ver "2 de N" mantido; no dia seguinte (relógio simulado) tudo volta pendente.

### Tests (escrever antes)

- [x] T014 [P] [US1] Teste unitário do service de dias (hoje, marcar e desmarcar idempotentes, recusar atividade removida, virada do dia) em `backend/node/src/modules/days/days.service.test.ts`
- [x] T015 [P] [US1] Teste HTTP de `GET /days/today`, `PUT` e `DELETE /days/today/checks/:activityId` em `backend/node/src/modules/days/days.routes.integration.test.ts`
- [x] T016 [P] [US1] Teste de tela: lista de hoje, marcar/desmarcar, progresso, mensagem de dia concluído e erro ao salvar com nova tentativa em `frontend/react/src/features/today/Today.test.jsx`

### Implementation

- [x] T017 [P] [US1] Schemas Zod de dias em `backend/node/src/modules/days/days.schemas.ts`
- [x] T018 [US1] Repository (consulta do dia, criar/apagar marcação) em `backend/node/src/modules/days/days.repository.ts`
- [x] T019 [US1] Service de dias em `backend/node/src/modules/days/days.service.ts`
- [x] T020 [US1] Controller e rotas `/api/v1/days/:date` e `/days/today/checks/:activityId` em `backend/node/src/modules/days/`, registradas em `app.ts`
- [x] T021 [P] [US1] Seed de exemplo (poucas atividades em português) em `backend/node/prisma/seed.ts`, só para uso local
- [x] T022 [US1] Tela Hoje em `frontend/react/src/features/today/` com progresso "X de N", estado de carregamento, erro e mensagem de dia concluído
- [x] T023 [US1] Conferir contraste (texto 4,5:1) e uso por teclado nos estados feito e pendente

**Checkpoint**: Hoje funciona sozinha com as atividades do seed.

---

## Phase 4: User Story 2 — Montar e ajustar a minha lista (P2)

**Goal**: cadastrar, renomear, mover e remover atividades.

**Independent Test**: adicionar "Ler e-mails", renomear, mover para o topo e remover; cada passo aparece na hora e a ordem persiste.

### Tests (escrever antes)

- [x] T024 [P] [US2] Teste unitário do service de atividades (nome em branco, 120 caracteres, repetido permitido, posição, remover recompacta, reordenar com ids faltando ou repetidos) em `backend/node/src/modules/activities/activities.service.test.ts`
- [x] T025 [P] [US2] Teste HTTP de `GET/POST/PATCH/DELETE /activities` e `PUT /activities/order` em `backend/node/src/modules/activities/activities.routes.integration.test.ts`
- [x] T026 [P] [US2] Teste de tela: adicionar, erro de nome em branco, renomear, mover por teclado, remover com confirmação em `frontend/react/src/features/activities/Activities.test.jsx`

### Implementation

- [x] T027 [P] [US2] Schemas Zod de atividades em `backend/node/src/modules/activities/activities.schemas.ts`
- [x] T028 [US2] Repository de atividades (soft delete, posição) em `backend/node/src/modules/activities/activities.repository.ts`
- [x] T029 [US2] Service de atividades em `backend/node/src/modules/activities/activities.service.ts`
- [x] T030 [US2] Controller e rotas `/api/v1/activities` em `backend/node/src/modules/activities/`, registradas em `app.ts`
- [x] T031 [US2] Tela Atividades em `frontend/react/src/features/activities/`: formulário, edição, botões subir/descer, remoção com Modal de confirmação, lista vazia convidando a adicionar
- [x] T032 [US2] Garantir que a remoção na tela preserva o dia de hoje coerente (atividade some e o progresso se ajusta)

**Checkpoint**: US1 e US2 juntas formam o produto utilizável do dia a dia.

---

## Phase 5: User Story 3 — Ver como foram meus dias anteriores (P3)

**Goal**: consultar dias passados com "feitas de total" e o detalhe de cada dia.

**Independent Test**: após dois dias de uso, o histórico mostra os dois dias, e o detalhe lista feitas e pendentes, inclusive de atividade removida depois.

### Tests (escrever antes)

- [x] T033 [P] [US3] Teste unitário do histórico (dia sem marcação "0 de N", atividade removida continua no passado, atividade criada depois não entra em dia anterior) em `backend/node/src/modules/days/history.service.test.ts`
- [x] T034 [P] [US3] Teste HTTP de `GET /days` (paginado) e `GET /days/:date` passado, futuro e inexistente em `backend/node/src/modules/days/history.routes.integration.test.ts`
- [x] T035 [P] [US3] Teste de tela do histórico e do detalhe do dia em `frontend/react/src/features/history/History.test.jsx`

### Implementation

- [x] T036 [US3] Consulta e service do histórico em `backend/node/src/modules/days/` (reaproveitando o repository de dias)
- [x] T037 [US3] Rota `GET /api/v1/days` com paginação e `GET /days/AAAA-MM-DD` somente leitura
- [x] T038 [US3] Tela Histórico em `frontend/react/src/features/history/`: lista de dias (dd/mm/aaaa) e detalhe com feitas e pendentes

**Checkpoint**: as três histórias funcionam.

---

## Phase 6: Acabamento

- [x] T039 [P] Revisar textos em português do ADS (sentence case, botões com verbos curtos, sem emoji, estados vazios) e responsividade no celular
- [x] T040 [P] Revisar acessibilidade (ordem de foco, rótulos, mensagens de erro anunciadas)
- [x] T041 Rodar lint, tipos e todos os testes (`api` e `web`) até ficarem verdes
- [x] T042 Executar o roteiro de `quickstart.md` de ponta a ponta com o ambiente de pé
- [x] T043 Informar a URL de acesso e o que ficou de fora desta versão

---

## Dependencies & Execution Order

- Setup (T001–T005) → Foundational (T006–T013) → histórias → Acabamento.
- Dentro do Foundational: T006 → T007 antes de qualquer teste de rota; T008–T013 em paralelo entre si.
- US1 não depende de US2 (usa seed). US2 e US3 só dependem do Foundational. US3 reaproveita o repository de dias da US1 (T018), então vem depois dela.
- Em cada história: testes primeiro (devem falhar), depois repository → service → controller → tela.

## Parallel Example: User Story 1

```text
T014, T015, T016 (testes, arquivos diferentes)
T017 e T021 (schemas e seed)
```

## Implementation Strategy

1. Setup + Foundational.
2. US1 e parar para validar com você (a tela Hoje já funciona com os dados de exemplo).
3. US2 (agora dá para montar a própria lista) e validar.
4. US3 e Acabamento.

## Notes

- Nenhum comando que apaga dados do banco será executado sem sua confirmação.
- Commit ao fim de cada história, se você pedir.
