# UI_RULES.md — Ja'umina ERP (frontend)

**Identidad visual:** "White Bloom & Gold" — tokens en `src/app/globals.css`
vía `@theme` de Tailwind v4 (no hay `tailwind.config.js`, es CSS-first).

| Rol | Token | Hex |
|---|---|---|
| Fondo base | `--paper` | `#FFFFFF` |
| Fondo app | `--paper-muted` | `#F8F9FA` |
| Acento premium (marca, bordes, iconos activos) | `--champagne-gold` | `#D4AF37` |
| Hover / fondos suaves de tarjetas | `--blush` | `#F1ECE9` |
| Texto | `--anthracite` | `#2D2D2D` |

Tipografía: Inter (`--font-sans`, texto general) + Outfit (`--font-display`,
títulos). Semánticos: `--ice-emerald` (éxito), `--velvet-rose` (error/crítico),
`--amber-warning` (advertencia).

**Tema oscuro legacy** (`--obsidian-*`, `--ivory`, `--smoke`, `.glass-panel`):
reservado exclusivamente para `/cotizador` (recetario de coctelería). No lo
reutilices en pantallas nuevas del ERP — todo lo demás usa White Bloom & Gold.

## Navegación

Sidebar en `src/modules/shared/components/Sidebar.tsx` +`nav-items.ts`,
agrupado: **Principal** · **Operaciones** · **Finanzas** · **Administración**
(ver ese archivo para la lista exacta de items — es la fuente de verdad, no
la dupliques a mano en otro lado).

## UX

- Mobile first.
- Skeletons mientras carga (no spinners genéricos).
- Estados vacíos con mensaje amigable + ícono, nunca una tabla en blanco.
- Errores de conexión/backend con mensaje explícito (`ErrorBanner` en
  `dashboard/page.tsx` es el patrón a reutilizar) — nunca fallar en silencio
  mostrando datos vacíos como si fueran reales.

## Componentes reutilizables

`components/ui/{Modal,Field,styles}.tsx` — usalos para forms/botones nuevos
en vez de repetir clases de Tailwind a mano en cada página.
