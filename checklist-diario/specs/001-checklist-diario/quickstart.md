# Quickstart: validar o checklist de ponta a ponta

## Pré-requisito
Docker Desktop aberto. Na pasta `checklist-diario`: `cp .env.example .env`.

## Subir
```bash
docker compose up -d --build --wait
docker compose ps
```
Esperado: `postgres`, `api` e `web` saudáveis. Tela em http://localhost:3000 (portas em `.env`).

## Roteiro (cobre as três histórias)
1. Abrir a tela: aparece a lista vazia com convite para adicionar (edge case).
2. Em "Atividades", adicionar "Beber água", "Ler e-mails" e "Caminhar". Renomear uma, mover outra para o topo (por teclado também), recarregar: a ordem permanece (US2).
3. Em "Hoje", marcar duas: progresso "2 de 3". Recarregar: continuam marcadas. Desmarcar uma: "1 de 3" (US1).
4. Marcar tudo: aparece a mensagem de dia concluído.
5. Remover "Caminhar" com confirmação: some de hoje (US2).
6. Em "Histórico", ver hoje com "feitas de total"; abrir o dia e ver feitas e pendentes (US3).
7. Tentar adicionar nome em branco: a tela explica; nome com mais de 120 caracteres: aviso.

## Testes automáticos
```bash
docker compose exec api npm run lint
docker compose exec api npm test
docker compose exec api npm run test:integration
docker compose exec web npm test
```
Esperado: tudo verde.

## Virada do dia
Coberta por teste automático com relógio simulado em `America/Sao_Paulo` (23:59 → 00:00): atividades voltam pendentes e o dia anterior aparece no histórico.
