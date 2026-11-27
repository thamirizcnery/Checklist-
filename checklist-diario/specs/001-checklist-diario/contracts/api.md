# Contrato da API — `/api/v1`

Erros: `{ "error": { "code": "...", "message": "...", "details": [] } }`. Códigos: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409). Mensagens em português. Instantes em ISO 8601 UTC; dias em `AAAA-MM-DD`.

## Atividades

| Método e rota | O que faz | Corpo | Resposta |
|---|---|---|---|
| `GET /activities?page=1&pageSize=50` | Lista as ativas por posição (pageSize máx. 100) | — | `200 { data: [{id, name, position}], page, pageSize, total }` |
| `POST /activities` | Cria | `{ name }` | `201 { id, name, position }` |
| `PATCH /activities/:id` | Renomeia | `{ name }` | `200 { id, name, position }` |
| `DELETE /activities/:id` | Remove (soft delete) | — | `204` |
| `PUT /activities/order` | Define a ordem | `{ ids: [id, ...] }` com todas as ativas | `200 { data: [{id, name, position}] }` |

Validação: `name` aparado, 1 a 120 caracteres, senão `VALIDATION_ERROR`. `id` inexistente ou já removido: `NOT_FOUND`.

## Dias

`:date` aceita `today` ou `AAAA-MM-DD`. Data futura ou anterior ao primeiro uso: `NOT_FOUND`.

| Método e rota | O que faz | Resposta |
|---|---|---|
| `GET /days/:date` | Atividades do dia com o estado de cada uma | `200 { date, done, total, activities: [{id, name, done}] }` |
| `PUT /days/today/checks/:activityId` | Marca como feita (idempotente) | `200` com o dia atualizado (mesmo formato do `GET`) |
| `DELETE /days/today/checks/:activityId` | Desmarca (idempotente) | `200` com o dia atualizado |
| `GET /days?page=1&pageSize=30` | Histórico, do mais recente ao mais antigo, inclui hoje | `200 { data: [{date, done, total}], page, pageSize, total }` |

Marcar ou desmarcar com `:date` diferente de `today` não existe na rota (só `today`). Atividade removida ou inexistente: `NOT_FOUND`.

## Saúde

`GET /health` (processo no ar) e `GET /health/ready` (banco acessível), como no esqueleto.
