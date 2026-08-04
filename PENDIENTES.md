# PENDIENTES — Ja'umina ERP

> Solo tareas activas. Cada tarea resuelta se borra en el momento, no se archiva acá.
> Historial completo de decisiones: `git log` (cada commit explica su porqué).

## Alta

- [ ] Cambiar la contraseña del usuario Admin de seed (`Admin123!`) antes de
      cualquier uso real — hoy es la misma en dev y en Neon/producción.
- [ ] Auditoría automática en los módulos viejos de coctelería (`events`,
      `recipes`, `ingredients`): solo los módulos nuevos (`clientes`, `ventas`,
      etc.) loggean en `AuditLog` vía `AuditService`.
- [ ] CRUD de `Staff` (backend + frontend): no existe endpoint para listarlo,
      por eso `/eventos` no puede asignar personal al crear un evento.

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
