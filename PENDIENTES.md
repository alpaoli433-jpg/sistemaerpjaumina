# PENDIENTES — Ja'umina ERP

> Solo tareas activas. Cada tarea resuelta se borra en el momento, no se archiva acá.
> Historial completo de decisiones: `git log` (cada commit explica su porqué).

## Alta

- [ ] Setear `ADMIN_SEED_PASSWORD` en el dashboard de Render (mismo valor
      usado para rotar el hash localmente, o uno nuevo) — hoy solo está
      documentada en `render.yaml`, no cargada. No requiere volver a correr
      el seed: es solo para que quede consistente si alguna vez se necesita.
      **Requiere acceso manual al dashboard de Render — no automatizable
      desde acá.**

## Media

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
