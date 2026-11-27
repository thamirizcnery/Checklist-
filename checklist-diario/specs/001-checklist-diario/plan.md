# Implementation Plan: Checklist de atividades diárias

**Branch**: `001-checklist-diario` | **Date**: 2026-11-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-checklist-diario/spec.md`

## Summary

Aplicação web pessoal para cadastrar atividades diárias, marcar o que foi feito hoje e consultar dias anteriores. Três serviços no Docker Compose: banco PostgreSQL, API Node + TypeScript (Prisma) e tela React + Vite + Tailwind, com o visual do design system Alquimia (ADS). Duas tabelas: `activities` (a lista) e `activity_checks` (uma linha por atividade feita em um dia). A virada do dia é calculada pela API no horário de Brasília.

## For the reader

Chosen: Guardar as atividades e as marcações num banco de dados, com uma tela React que usa as cores e as fontes do Alquimia.

Why: Assim as marcações não somem ao reiniciar o computador, e o visual fica igual ao dos outros produtos da Farmarcas.

## Technical Context

**Language/Version**: TypeScript em Node 22 (API); JavaScript/JSX em React 19 com Vite (tela)

**Primary Dependencies**: Express 5, Zod, Prisma 7 + PostgreSQL, pino (API); React, Tailwind CSS (tela). Os mesmos do esqueleto `backend/node` e `frontend/react` do Golden Path.

**Storage**: PostgreSQL 16, volume nomeado, migrations pelo Prisma Migrate

**Testing**: Vitest para a regra de negócio dos services; Supertest para as rotas HTTP (banco `<POSTGRES_DB>_test`); Vitest + Testing Library para os fluxos principais da tela

**Target Platform**: Navegador no computador e no celular; ambiente local via Docker Compose

**Project Type**: Aplicação web (frontend + backend + banco)

**Performance Goals**: Tela do dia pronta em até 2 s após abrir (SC-002), um clique para marcar (SC-001)

**Constraints**: Português do Brasil; datas dd/mm/aaaa na tela; navegação por teclado; sem login (decisão do spec); portas só em `127.0.0.1`

**Scale/Scope**: Uma pessoa, dezenas de atividades, alguns anos de histórico; 3 telas (Hoje, Atividades, Histórico)

## Constitution Check

*GATE: passou antes da pesquisa e foi reavaliado após o desenho.*

| Princípio | Situação |
|---|---|
| I. Spec Kit obrigatório | Atende: spec aprovado, plano agora, tarefas e código depois. |
| II. Tudo roda no Docker | Atende: `docker compose up -d --build --wait` sobe tudo; nada instalado na máquina. |
| III. Stack padrão | Atende: PostgreSQL 16, Node 22 + TypeScript + Prisma, React + Vite + Tailwind. Nenhum desvio. |
| IV. Banco só muda por migration | Atende: schema em `prisma/schema.prisma`, migration versionada. |
| V. Dados locais protegidos | Atende: nenhum comando destrutivo planejado. |
| VI. Linguagem simples | Atende. |
| VII. Começar pequeno | Atende: três histórias entregues na ordem P1, P2, P3. |
| VIII. Agente decide o técnico | Atende: escolhas em `research.md`; a pessoa só vê "Chosen / Why". |
| IX. Aplicação fora do Golden Path | Atende: tudo em `checklist-diario`, copiando só modelos do Golden Path. |

Sem violações, então não há Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-checklist-diario/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
├── checklists/requirements.md
└── tasks.md             # criado por /speckit-tasks
```

### Source Code (repository root)

```text
checklist-diario/
├── docker-compose.yml          # postgres, api, web (copiado do Golden Path)
├── .env.example
├── backend/node/
│   ├── prisma/
│   │   ├── schema.prisma       # Activity, ActivityCheck
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── shared/             # erros, logger, validação, data de Brasília
│       └── modules/
│           ├── activities/     # routes, controller, service, repository, schemas, testes
│           └── days/           # tela de hoje, marcar/desmarcar, histórico
└── frontend/react/
    └── src/
        ├── app/                # rotas e layout (barra superior)
        ├── features/
        │   ├── today/          # lista do dia, progresso
        │   ├── activities/     # cadastro, edição, ordem, remoção
        │   └── history/        # lista de dias e detalhe do dia
        ├── components/ui/      # Button, Input, Checkbox, Modal, Toast, EmptyState (ADS)
        ├── services/           # chamadas à API
        └── styles/             # tokens do ADS no Tailwind
```

**Structure Decision**: Aplicação web com `backend/node` e `frontend/react`, a mesma organização do Golden Path, para reaproveitar Dockerfiles, healthchecks e o contrato de erros. O esqueleto de exemplo (`users`) é trocado pelos módulos `activities` e `days`.
