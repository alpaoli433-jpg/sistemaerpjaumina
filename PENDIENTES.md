# PENDIENTES — Ja'umina ERP

> Solo tareas activas. Cada tarea resuelta se borra en el momento, no se archiva acá.
> Historial completo de decisiones: `git log` (cada commit explica su porqué).

## Alta

- [ ] Rotar la contraseña real del Admin en Neon/producción: el seed ya exige
      `ADMIN_SEED_PASSWORD` cuando `NODE_ENV=production` (si falta, falla) y
      el `upsert` ahora sí actualiza el hash en un usuario existente — falta
      setear esa env var en Render y correr `npx prisma db seed` una vez
      contra la DB de producción para reemplazar el hash de `Admin123!`.

## Media

- [ ] Migrar los módulos viejos (`auth`, `users`, `ingredients`, `recipes`,
      `events`, `dashboard`, `prisma`, `common`) a `src/modules/...` para
      consistencia con el resto del backend (regla de arquitectura §6).
- [ ] Definir con el usuario qué es "Servicios" antes de construir su modelo
      (¿= `Producto`? ¿dotación de staff/equipamiento por evento?) — hoy es
      un stub sin backend.
- [ ] Paginación server-side en listados (`/clientes`, `/productos`, etc.)
      antes de que el volumen de datos crezca en producción.
- [ ] Setear `FRONTEND_URL` en las env vars del servicio de Render cuando el
      frontend tenga su propio deploy (CORS).

## Baja

- [ ] Export a PDF real en Reportes (hoy solo CSV client-side).
- [ ] Graphviz no está instalado — el grafo de arquitectura solo genera
      `.dot`/`.json`, no imágenes.
- [ ] `@nestjs/bullmq`/`bullmq` instalados sin ningún consumidor todavía.
- [ ] `gitleaks` (hook de pre-commit) es un binario, no un paquete npm —
      instalarlo a mano en cada máquina nueva que vaya a commitear.
