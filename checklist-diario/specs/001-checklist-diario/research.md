# Research: Checklist de atividades diárias

Nenhuma dúvida técnica ficou em aberto. Tudo abaixo é decisão do agente.

## 1. Stack
- **Decision**: stack padrão da constituição (PostgreSQL 16, Node 22 + TypeScript + Prisma, React + Vite + Tailwind, Docker Compose).
- **Rationale**: pedido não escolheu outra; reaproveita o esqueleto que já roda.
- **Alternatives considered**: Python/FastAPI (sem motivo para trocar); guardar no navegador (`localStorage`), que seria mais simples, mas perde os dados ao limpar o navegador e não segue o padrão.

## 2. Modelo de dados e chave primária
- **Decision**: `activities` e `activity_checks`, com chave `bigint` identity.
- **Rationale**: uso individual, IDs gerados só no banco, sem sincronização offline (critério `bigint` do DATABASE.md). Uma linha em `activity_checks` por atividade feita em um dia, com unicidade (atividade, dia): marcar duas vezes não duplica.
- **Alternatives considered**: UUIDv7 (sem API pública nem merge entre ambientes); coluna de "feito" na atividade zerada por rotina à meia-noite (perderia o histórico e exigiria um job).

## 3. Remoção sem perder histórico
- **Decision**: soft delete (`deleted_at`) em `activities`; `activity_checks` nunca é apagada.
- **Rationale**: FR-009 e a regra de exclusão lógica do DATABASE.md. Um dia passado mostra as atividades que existiam naquele dia: criadas até o fim dele e removidas depois dele (ou nunca).
- **Alternatives considered**: apagar de verdade com cascata (destrói o histórico).

## 4. "Hoje" e fuso horário
- **Decision**: a API calcula "hoje" em `America/Sao_Paulo`. A tela chama `/days/today` e nunca envia a data. O dia é uma coluna `date` (sem horário). Instantes (`created_at`) em UTC (`timestamptz`).
- **Rationale**: evita o navegador e o servidor discordarem sobre o dia, e o container roda em UTC. Cobre a virada do dia (edge case do spec).
- **Alternatives considered**: usar a data do navegador (muda com o fuso do aparelho e permite marcar dias errados).

## 5. Marcar só o dia de hoje
- **Decision**: marcar e desmarcar só vale para hoje; dias anteriores são só consulta.
- **Rationale**: o spec trata o histórico como consulta (história 3) e isso evita "preencher dias" depois.
- **Alternatives considered**: permitir editar dias passados (fora do pedido).

## 6. Ordem das atividades
- **Decision**: coluna `position` inteira; botões "Mover para cima/baixo" em vez de arrastar; a API recebe a lista completa de IDs na nova ordem.
- **Rationale**: funciona por teclado e no celular (FR-011) e é mais simples de testar.
- **Alternatives considered**: arrastar e soltar (exige biblioteca e tratamento extra de acessibilidade).

## 7. Contrato da API
- **Decision**: segue o contrato comum do Golden Path: `/api/v1`, recursos no plural, erros `{ error: { code, message, details } }`, listagens paginadas, `/health` e `/health/ready`. Detalhes em `contracts/api.md`.
- **Rationale**: é a regra de BACKEND.md.

## 8. Tela e design system
- **Decision**: Tailwind com os tokens do Alquimia (azul `#006FF7`, neutros `#061938` → `#FAFBFC`, Inter, raios 4/6/8px, escala de espaço do ADS). Componentes próprios (`Button`, `Input`, `Checkbox`, `Modal`, `Toast`, `EmptyState`) recriados a partir do README e dos tokens do ADS. Ícones Lucide pelo pacote `lucide-react` (o ADS só traz PNGs, sem controle de cor).
- **Rationale**: pedido de usar o ADS; o pacote do ADS é um bundle de PNG e não serve como biblioteca importável.
- **Alternatives considered**: copiar `_ds_bundle.js` do ADS (acopla a aplicação a um arquivo gerado, com caminhos próprios).
- **Atenção**: os contrastes do ADS devem ser conferidos nos estados feito e pendente (texto 4,5:1).

## 9. Testes
- **Decision**: Vitest nos services (regra do dia e da remoção), Supertest nas rotas, Vitest + Testing Library nos fluxos "marcar", "adicionar" e "histórico". TDD: teste antes do código.
- **Rationale**: BACKEND.md exige lint, tipos e testes verdes na entrega.
