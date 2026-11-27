# Data Model: Checklist de atividades diárias

Chave primária `bigint` identity em todas as tabelas (decisão em `research.md`, item 2). Instantes em `timestamptz`; dia em `date`.

## activities

| Coluna | Tipo | Regra |
|---|---|---|
| id | bigint identity | PK |
| name | text | obrigatório, 1 a 120 caracteres depois de aparar espaços; repetido é permitido |
| position | integer | ordem na lista entre as ativas, a partir de 1 |
| created_at | timestamptz | padrão `now()` |
| updated_at | timestamptz | atualizado a cada edição |
| deleted_at | timestamptz null | preenchido ao remover (soft delete) |

Índice: `(position)` parcial `WHERE deleted_at IS NULL`.

## activity_checks

| Coluna | Tipo | Regra |
|---|---|---|
| id | bigint identity | PK |
| activity_id | bigint | FK para `activities.id`, sem cascata |
| day | date | dia em `America/Sao_Paulo` |
| checked_at | timestamptz | padrão `now()` |

Unicidade: `(activity_id, day)`. Desmarcar apaga a linha (tabela técnica, sem soft delete: não é dado de negócio a preservar).

## Regras

- **Hoje**: lista as atividades com `deleted_at` nulo, ordenadas por `position`; "feita" = existe linha em `activity_checks` para (atividade, hoje).
- **Dia passado D**: atividades com `created_at` em dia <= D e (`deleted_at` nulo ou dia de `deleted_at` > D). Pendente = sem linha naquele dia. O nome mostrado é o atual.
- **Criar**: `position` = maior posição ativa + 1.
- **Remover**: define `deleted_at`; as posições restantes são recompactadas.
- **Reordenar**: recebe todos os IDs ativos na nova ordem; ids faltando, repetidos ou desconhecidos geram erro de validação.
- **Marcar**: cria linha se não existir (idempotente). **Desmarcar**: apaga a linha se existir (idempotente). Só para hoje e só para atividade ativa.
- **Histórico**: um dia só entra se houver ao menos uma atividade existente nele; contagem `feitas/total`. Dias sem nenhuma marcação aparecem como "0 de N" entre o primeiro dia de uso e hoje.

## Estados

Atividade: ativa → removida (sem volta nesta versão). Marcação do dia: pendente ⇄ feita (só hoje).
