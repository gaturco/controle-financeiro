# Controle Financeiro — Gabriel e Fernanda

Controlador financeiro pessoal para Gabriel e Fernanda, com gestão de entradas mensais, gastos fixos e variáveis, e controle detalhado dos gastos da obra.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — rodar o servidor API (porta 8080)
- `pnpm --filter @workspace/financeiro run dev` — rodar o frontend (porta 25404)
- `pnpm run typecheck` — typecheck completo em todos os pacotes
- `pnpm run build` — typecheck + build de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks e schemas Zod a partir do spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar mudanças de schema no banco (dev only)
- Required env: `DATABASE_URL` — string de conexão Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validação: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — contrato OpenAPI (source of truth)
- `lib/db/src/schema/incomes.ts` — schema da tabela de entradas
- `lib/db/src/schema/expenses.ts` — schema da tabela de gastos
- `lib/api-client-react/src/generated/` — hooks React Query gerados
- `lib/api-zod/src/generated/` — schemas Zod para validação no servidor
- `artifacts/api-server/src/routes/` — rotas da API
- `artifacts/financeiro/src/` — frontend React

## Architecture decisions

- OpenAPI-first: toda a API é definida em `openapi.yaml` e os hooks/schemas são gerados via Orval
- Gastos de obra parcelados: o campo `monthlyAmount` é calculado automaticamente no backend (amount / totalInstallments)
- O resumo mensal (`/api/summary`) agrega entradas e gastos em tempo real sem cache
- Gastos de obra têm painel dedicado (`/obra`) com custo mensal calculado para parcelados

## Product

- Dashboard mensal com receitas, despesas, saldo, gastos por categoria e total de obra
- Gestão de entradas (salário, bônus, PLR, 13° salário, outros) por pessoa (Gabriel/Fernanda)
- Gestão de gastos fixos e variáveis com categorias (obra, alimentação, transporte, saúde, educação, lazer, cartão de crédito, outros)
- Gastos de obra: diferenciação entre parcelado e à vista, com cálculo automático do custo mensal
- Painel exclusivo da obra com total investido e compromisso mensal

## User preferences

- Idioma: Português (pt-BR)
- Dois usuários principais: Gabriel e Fernanda

## Gotchas

- Sempre rodar `pnpm --filter @workspace/api-spec run codegen` após mudar o `openapi.yaml`
- Rodar `pnpm --filter @workspace/db run push` após mudar qualquer schema em `lib/db/src/schema/`
- O campo `monthlyAmount` é calculado e persistido no banco — não calcular no frontend

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
