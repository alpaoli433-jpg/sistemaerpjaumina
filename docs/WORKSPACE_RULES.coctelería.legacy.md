# WORKFLOW ERP COCTELERÍA PREMIUM v1.0 (Antigravity)

---

## 1. OBJETIVO Y ESTILO

Desarrollar una **Web App PWA** de gestión para empresa de **Coctelería Premium para Eventos**.

### Estilo Visual: Luxury / High-End

| Token                | Valor                          | Uso                                    |
| -------------------- | ------------------------------ | -------------------------------------- |
| **Dark Obsidian**    | `#0A0A0C`                      | Fondo principal, superficies base      |
| **Champagne Gold**   | `#D4AF37`                      | Acentos, CTAs, bordes premium          |
| **Glassmorphism**    | `backdrop-blur` + transparencia| Cards, modales, paneles flotantes       |
| **UI Fluida**        | Framer Motion                  | Transiciones, micro-animaciones        |

### Principios de Diseño
- **Móvil First**: Completamente optimizado para smartphones y tablets.
- **Offline-Ready**: Funcionalidades críticas disponibles sin conexión vía IndexedDB.
- **Operación rápida**: Navegación con gestos, accesos directos, flujos mínimos de taps.
- **Sensación premium**: Cada interacción debe sentirse elegante y pulida.

---

## 2. STACK TÉCNICO

| Capa                     | Tecnología                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| **Frontend**             | Next.js 15 (App Router), Tailwind CSS v4, Shadcn/ui              |
| **Animaciones**          | Framer Motion                                                     |
| **Iconografía**          | Lucide Icons                                                      |
| **Persistencia Offline** | IndexedDB vía `idb-keyval`                                       |
| **Backend**              | NestJS 10 / Next.js Server Actions                                |
| **ORM**                  | Prisma                                                            |
| **Base de Datos**        | PostgreSQL                                                        |
| **Moneda Base**          | Guaraníes (₲)                                                    |

---

## 3. MÓDULOS PRINCIPALES

### 3.1 📊 Dashboard Ejecutivo
- KPIs en tiempo real: Ingresos ₲, Gastos ₲, Margen de ganancia
- Contador de eventos (mes actual, próximos, completados)
- Gráficos de tendencia con animaciones suaves
- Cards con glassmorphism y acentos dorados

### 3.2 🍸 Recetario & Escandallo de Tragos
- Catálogo de recetas con foto, ingredientes y procedimiento
- Escandallo por trago: costo unitario de cada ingrediente en ₲
- Cálculo automático de costo total y precio sugerido
- Categorización (Clásicos, Signature, Sin Alcohol, Shots)

### 3.3 💰 Cotizador de Eventos
- **Algoritmo de cálculo de insumos** basado en:
  - Cantidad de invitados
  - Duración del evento (horas)
  - Selección de tragos del menú
  - Ratio de consumo estimado por persona/hora
- Generación de cotización en ₲ con desglose detallado
- Exportación / compartir cotización

### 3.4 📅 Gestión de Eventos & Pipeline (Kanban)
- Pipeline visual: `Consulta → Cotizado → Confirmado → En Curso → Finalizado`
- Drag & drop entre columnas
- Ficha del evento: fecha, lugar, cliente, menú, staff asignado
- Timeline / calendario de eventos

### 3.5 📦 Control de Insumos & Checklist de Logística
- Inventario de insumos con stock actual y stock mínimo
- Checklist pre-evento: insumos, equipamiento, transporte
- Alertas de stock bajo
- Registro de compras y proveedores

### 3.6 👥 Staff & Bartenders
- Directorio de bartenders y personal de apoyo
- Asignación de staff por evento
- Disponibilidad y calendario
- Historial de participación en eventos

---

## 4. REGLAS DE ORO

1. **Seguridad**: Credenciales y claves API exclusivamente en `.env`. Nunca en el repositorio.
2. **Moneda**: Todos los cálculos monetarios en **Guaraníes (₲)**. Sin decimales (moneda entera).
3. **Mobile First**: Diseñar primero para móvil, luego escalar a tablet/desktop.
4. **Premium Always**: Ningún componente debe verse genérico. Glassmorphism, gradientes sutiles, tipografía elegante.
5. **Commits Atómicos**: Un commit por sub-tarea completada y verificada.
6. **Idioma Código**: Inglés para código, Español para UI y documentación.

---

## 5. CONVENCIONES

### Naming

| Tipo               | Convención            | Ejemplo                    |
| ------------------ | --------------------- | -------------------------- |
| Componentes        | PascalCase            | `EventCard.tsx`            |
| Funciones/Hooks    | camelCase             | `useEventPipeline()`       |
| Modelos Prisma     | PascalCase (singular) | `model Recipe {}`          |
| Rutas API          | kebab-case (plural)   | `/api/events`              |
| Constantes         | UPPER_SNAKE_CASE      | `CONSUMPTION_RATIO`        |
| Archivos CSS       | kebab-case            | `dashboard-stats.css`      |

### Modelos de Datos
- Todos los modelos incluyen `createdAt` y `updatedAt`.
- Soft-delete (`deletedAt`) donde aplique.
- Montos siempre como `Int` (Guaraníes sin decimales).

### Git
- Prefijos: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `style:`
- Ramas: `feature/nombre`, `fix/descripcion`
- No push directo a `main`.

---

## 6. ESTRUCTURA DEL PROYECTO

```
erp-distribuidora/
├── .agents/              # Configuración Antigravity
│   ├── rules/
│   └── workflows/
├── backend/              # API — NestJS 10
├── frontend/             # PWA — Next.js 15 (App Router)
│   ├── app/              # Rutas (App Router)
│   ├── components/       # Componentes reutilizables
│   │   └── ui/           # Shadcn/ui components
│   ├── lib/              # Utilidades, hooks, helpers
│   └── public/           # Assets estáticos
├── prisma/               # Schema y migraciones
├── docs/                 # Documentación
└── WORKSPACE_RULES.md    # Este archivo
```

---

## 7. DESIGN SYSTEM & ESTILO VISUAL (High-End Luxury)

### Concepto: Dark Obsidian & Champagne Gold

| Rol                         | Color           | Token                  | Uso                                                  |
| --------------------------- | --------------- | ---------------------- | ---------------------------------------------------- |
| **Fondo Principal**         | `#0A0A0C`       | `--obsidian-deep`      | Background global, superficies base                   |
| **Tarjetas y Paneles**      | `#121216`       | `--obsidian-card`      | Cards, modales, sidebars — con borde 1px dorado/translúcido |
| **Superficie Elevada**      | `#1A1A1F`       | `--obsidian-surface`   | Inputs, dropdowns, elementos elevados                 |
| **Acento Primario**         | `#D4AF37`       | `--champagne-gold`     | Botones principales, indicadores activos, destacados  |
| **Acento Positivo**         | `#10B981`       | `--ice-emerald`        | Saldos positivos, confirmaciones, estados exitosos    |
| **Acento Alertas**          | `#E11D48`       | `--velvet-rose`        | Stock crítico, errores, alertas importantes           |
| **Acento Advertencia**      | `#F39C12`       | `--amber-warning`      | Warnings, stock bajo, estados pendientes              |
| **Texto Primario**          | `#F5F0E8`       | `--ivory`              | Texto principal sobre fondos oscuros                  |
| **Texto Secundario**        | `#8A8A8E`       | `--smoke`              | Labels, placeholders, texto de apoyo                  |
| **Texto Terciario**         | `#B0B0B4`       | `--smoke-light`        | Subtítulos, metadata                                  |
| **Gold Claro**              | `#E8D48B`       | `--champagne-light`    | Hover states, gradientes gold                         |
| **Gold Oscuro**             | `#B8960F`       | `--champagne-dark`     | Bordes activos, pressed states                        |

### Glassmorphism

| Token              | Valor                             | Uso                              |
| ------------------ | --------------------------------- | -------------------------------- |
| `--glass-bg`       | `rgba(255, 255, 255, 0.05)`      | Fondo de paneles glass           |
| `--glass-border`   | `rgba(212, 175, 55, 0.15)`       | Bordes translúcidos dorados      |
| `--glass-blur`     | `backdrop-blur(16px)`            | Efecto blur en superficies       |

### Reglas de Estilo
- **Bordes de tarjetas**: Siempre `1px solid` con opacidad dorada/translúcida.
- **Moneda**: Formato en **Guaraníes (₲)**. Sin decimales. Separador de miles: punto.
- **Enfoque**: **Mobile-First**, PWA, respuesta rápida en smartphones.
- **Tipografía**: Font premium (Inter / Outfit) desde Google Fonts.
- **Animaciones**: Framer Motion para transiciones fluidas y micro-interacciones.

### CSS Design Tokens

```css
/* === COCTELERÍA PREMIUM — Design Tokens === */

/* Backgrounds */
--obsidian-deep:    #0A0A0C;
--obsidian-card:    #121216;
--obsidian-surface: #1A1A1F;

/* Gold Accent */
--champagne-gold:   #D4AF37;
--champagne-light:  #E8D48B;
--champagne-dark:   #B8960F;

/* Semantic */
--ice-emerald:      #10B981;
--velvet-rose:      #E11D48;
--amber-warning:    #F39C12;

/* Text */
--ivory:            #F5F0E8;
--smoke:            #8A8A8E;
--smoke-light:      #B0B0B4;

/* Glass */
--glass-bg:         rgba(255, 255, 255, 0.05);
--glass-border:     rgba(212, 175, 55, 0.15);
```

---

> **Última actualización:** 2026-08-04
