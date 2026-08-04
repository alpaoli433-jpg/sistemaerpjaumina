# JAUMINA_WORKSPACE_RULES.md

Ja'umina ERP — sistema de gestión modular y reutilizable entre rubros
(hoy conviven dos verticales: distribuidora genérica + coctelería legacy).

## Stack

Next.js + React + TS + Tailwind v4 (`erp-cocteleria-frontend/UI_RULES.md`) ·
NestJS · Prisma + PostgreSQL/Neon (`backend/DATABASE_RULES.md`)

## Comandos

```bash
cd backend && npm run start:dev   # build: npm run build · test: npm test && npm run test:e2e
cd erp-cocteleria-frontend && npm run dev   # build: npm run build
npx prisma generate|db push|db seed         # desde backend/
npm run graph:generate                      # desde la raíz -> .graph/architecture-map.json
npm run secrets:scan                        # gitleaks — también corre solo en cada commit (pre-commit hook)
```

## Principios y convenciones

Nunca duplicar lógica · SOLID · separar presentación/negocio/persistencia ·
módulos independientes y reutilizables · Componentes `PascalCase`, funciones
`camelCase`, constantes `UPPER_SNAKE_CASE` · commits `feat:`/`fix:`/`refactor:`/`docs:`/`chore:`.

## Arquitectura

Módulos nuevos en `src/modules/<nombre>/`. Los viejos (`auth`, `users`,
`ingredients`, `recipes`, `events`, `dashboard`, `prisma`, `common`) siguen
planos en `src/<nombre>/` — ver `PENDIENTES.md` antes de migrarlos.

## Reglas para Claude Code

Antes de cerrar tarea: compila, sin errores, sin duplicación, docs al día.
No modificar módulos sin necesidad · priorizar estabilidad · explicar
decisiones importantes · evitar dependencias innecesarias · consultar
`.graph/architecture-map.json` antes de leer fuentes, y correr
`npm run graph:generate` tras tocar un módulo.
