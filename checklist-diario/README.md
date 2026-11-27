# Checklist diário

Aplicação pessoal para marcar as atividades que você faz todo dia. Visual do design system Alquimia (ADS), da Farmarcas.

## Como rodar

Precisa do Docker Desktop aberto.

```bash
cp .env.example .env
docker compose up -d --build --wait
```

Depois abra http://localhost:3100 (as portas ficam no `.env`: tela `WEB_PORT`, API `API_PORT`, banco `POSTGRES_PORT`).

Para ter algumas atividades de exemplo:

```bash
docker compose exec api npm run seed
```

Para parar sem perder os dados: `docker compose down`.

## Testes

```bash
docker compose exec api npm test
docker compose exec api npm run test:integration
docker compose exec web npm test
```

## Onde está a especificação

`specs/001-checklist-diario/` (spec, plano, tarefas e roteiro de validação).
