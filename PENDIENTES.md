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

- [ ] Setear `FRONTEND_URL` en las env vars del servicio de Render cuando el
      frontend tenga su propio deploy (CORS).

## Baja

- [ ] Graphviz no está instalado — el grafo de arquitectura solo genera
      `.dot`/`.json`, no imágenes. Instalador vía `winget install
      Graphviz.Graphviz` requiere elevación UAC (solo hay build machine-scope,
      no user-scope) — **no automatizable desde una sesión no interactiva,
      requiere click manual de administrador una vez**.
- [ ] `gitleaks` (hook de pre-commit) es un binario, no un paquete npm —
      instalarlo a mano en cada máquina nueva que vaya a commitear.
