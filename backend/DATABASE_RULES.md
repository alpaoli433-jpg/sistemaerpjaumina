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
npx prisma db seed       # ⚠ DESTRUCTIVO, ver abajo — pide confirmación explícita
npx prisma studio        # explorador visual
```

**`prisma db seed` es destructivo.** `main()` arranca con una cadena de
`deleteMany()` que borra por completo `event`, `recipe`, `ingredient`,
`staff`, `auditLog`, `empleado`, `gasto`, `movimientoInventario`, `venta`,
`compra`, `cajaSesion`, `producto`, `proveedor` y `cliente` antes de
repoblarlas con el dataset demo hardcodeado. Solo el usuario Admin usa
`upsert` (no se borra). El `.env` local y el servicio de Render **apuntan a
la misma Neon** — correr `npx prisma db seed` tal cual contra esa DB destruye
cualquier dato real que haya en esas tablas, no es seguro "para rotar la
contraseña del Admin" ni para nada que no sea poblar una DB nueva/vacía.

**Guard (`assertSeedIsSafe` en `prisma/seed.ts`):** como local y Render usan
la misma URL, no hay forma de distinguir "DB segura" por `DATABASE_URL` —
el script aborta siempre al arrancar (antes de cualquier `deleteMany`) salvo
que se corra con `SEED_CONFIRM_DESTRUCTIVE=wipe-this-database` seteada a
mano. El mensaje de error muestra el host de la DB destino para poder
verificar antes de confirmar. Cubierto por `prisma/seed.spec.ts`.

Con `NODE_ENV=production` (Render), el seed además exige `ADMIN_SEED_PASSWORD`
en el entorno y falla si falta — pero eso solo gatea el hash del Admin, el
guard de arriba es lo que protege el resto del script.

**Para rotar solo la contraseña del Admin** en la DB compartida sin tocar el
resto: un script aislado que haga únicamente
`prisma.user.update({ where: { email: ... }, data: { password: hash } })`,
nunca el seed completo.

Usamos `db push` (no `migrate dev`) porque la base nunca tuvo historial de
migraciones — pasarse a `migrate dev` ahora pediría resetearla.

## Automatizaciones

Toda mutación relevante debe loggear en `AuditLog` vía el `AuditService`
compartido (`src/shared/audit/`) — no escribas en `AuditLog` directo desde un
service nuevo. Ejemplo real ya implementado: `Compra` → incrementa stock +
crea `Gasto` automático + audita, todo en una transacción Prisma.
