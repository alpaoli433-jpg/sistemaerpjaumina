# DATABASE_RULES.md — Ja'umina ERP (backend)

**Motor:** PostgreSQL (hoy: Neon, cloud). **ORM:** Prisma 7, config vía
`prisma.config.ts` (no pongas `url` inline en `schema.prisma`, ya se resuelve
desde ahí con `env("DATABASE_URL")`). Adapter: `@prisma/adapter-pg` en
`PrismaService` y `prisma/seed.ts`.

## Convenciones de esquema

- Normalizado, con Foreign Keys explícitas e índices en columnas de búsqueda
  frecuente.
- Soft delete: campo `deletedAt DateTime?` (camelCase — Prisma mapea directo,
  sin `@map`). Filtrar siempre `where: { deletedAt: null }` en los `find*` de
  módulos que lo tengan. Los módulos viejos de coctelería (`Ingredient`,
  `Recipe`, `Event`, `Staff`) **no** tienen soft delete todavía — no asumas
  que lo tienen.
- Todo modelo: `createdAt DateTime @default(now())` +
  `updatedAt DateTime @updatedAt`.
- Dinero: `Int` en Guaraníes (₲), sin decimales — los modelos legacy de
  coctelería usan `Float`, es deuda técnica conocida, no lo repitas en
  modelos nuevos.
- Fechas: `DateTime` (Prisma lo mapea a `timestamptz` en Postgres).

## Comandos (desde `backend/`)

```bash
npx prisma generate      # regenerar el cliente tras tocar schema.prisma
npx prisma db push       # aplicar el schema a la DB (no versiona migraciones)
npx prisma db seed       # 27 insumos, 12 recetas, admin, + dataset de distribuidora
npx prisma studio        # explorador visual
```

Con `NODE_ENV=production` (Render), `prisma db seed` exige `ADMIN_SEED_PASSWORD` en el
entorno y falla si falta — evita sembrar el Admin con la contraseña por defecto de dev
(`Admin123!`) fuera de una máquina local. Re-correr el seed con esa variable seteada
también rota el hash del Admin ya existente (el `upsert` actualiza `password`).

Usamos `db push` (no `migrate dev`) porque la base nunca tuvo historial de
migraciones — pasarse a `migrate dev` ahora pediría resetearla.

## Automatizaciones

Toda mutación relevante debe loggear en `AuditLog` vía el `AuditService`
compartido (`src/shared/audit/`) — no escribas en `AuditLog` directo desde un
service nuevo. Ejemplo real ya implementado: `Compra` → incrementa stock +
crea `Gasto` automático + audita, todo en una transacción Prisma.
