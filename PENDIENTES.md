# PENDIENTES — ERP Coctelería Premium

> Generado automáticamente. Última actualización: 2026-08-04.

## 0m. Deploy en Render arreglado y verificado en producción (2026-08-04)

El usuario compartió API key + Service ID de Render (`srv-d9ot841t0dsc73bqidig`
— OJO: en su mensaje el ID venía con dos variantes, "841t" y "841f"; la
correcta es "841t", la otra da 404) para que diagnosticara y arreglara el
deploy de forma autónoma vía API.

**Causa raíz real** (no era config de Render — el rootDir/buildCommand/
startCommand del servicio ya estaban exactamente como se pidió):
`backend/tsconfig.build.json` no fijaba `rootDir`, así que TypeScript
inferí­a la raíz común de los archivos compilados como `backend/` (por
`prisma.config.ts`, que vive fuera de `src/`) en vez de `backend/src/`. Eso
hacía que `nest build` generara `dist/src/main.js` en lugar de
`dist/main.js`, y el `startCommand: node dist/main.js` fallaba con
`Cannot find module '.../dist/main.js'` (confirmado leyendo los logs reales
del deploy vía `GET /v1/logs`).

**Fix**: se agregó `"rootDir": "src"` a `tsconfig.build.json` y se excluyó
`prisma.config.ts`/`prisma/**` de esa compilación (no los necesita: el CLI
de Prisma los lee directo de la fuente vía `tsx`/su propio loader, nunca
desde `dist/`). Verificado localmente que `dist/main.js` ahora existe.

**No hizo falta tocar la configuración del servicio en Render** — ya
coincidía con lo pedido. Solo faltaba el commit: el primer commit
("setup inicial...") se había hecho ANTES de la migración a Neon, así que
Render seguía deployando código con SQLite. Se commiteó todo lo pendiente
(migración a Postgres/Neon, el fix de arriba, `render.yaml`, el mapa de
arquitectura por grafos, fixes del dashboard) y se pusheó a `main` — con
`autoDeploy: yes` sobre esa rama, Render arrancó el deploy solo.

**Verificado end-to-end contra producción real** (no solo el build):
deploy pasó a `status: "live"` en ~1 minuto, y
`https://sistemaerpjaumina.onrender.com/recipes` y `/auth/login` devuelven
200 con datos reales de Neon. Nota: el plan `free` de Render duerme el
servicio tras inactividad — la primera request después de dormir tarda
~30s en responder (cold start), es esperable y no es un error.

## 0l. render.yaml (Infra as Code del backend) + CLI de Render instalada (2026-08-04)

- **`render.yaml`** en la raíz: define el web service `jaumina-erp-backend`
  (`rootDir: backend`, `buildCommand: npm install && npx prisma generate &&
  npm run build`, `startCommand: node dist/main.js`, `plan: free`,
  `region: virginia`). Nota: el campo correcto del Blueprint spec de Render
  es `rootDir`, no `rootDirectory` como se nombró en la conversación —
  verificado contra la documentación oficial. `DATABASE_URL`, `JWT_SECRET` y
  `FRONTEND_URL` quedaron con `sync: false` (se cargan a mano en el
  dashboard de Render al crear el Blueprint, nunca en texto plano en el
  repo). Validado parseando el YAML con `js-yaml` (ya presente como
  dependencia transitiva, no se instaló nada nuevo).
- **Render CLI** (`render-oss/cli` v2.22.0) instalada en
  `C:\Users\alvar\bin\render.exe` (ya en PATH). Todavía **sin autenticar**
  — falta `render login` (interactivo) o `RENDER_API_KEY`, que solo el
  usuario puede generar desde su dashboard de Render. Sin esto no se puede
  crear el servicio en Render ni conectar el MCP oficial
  (`https://mcp.render.com/mcp`).
- **Pendiente explícito**: el usuario todavía no decidió cómo autenticar
  (correr los comandos él mismo con `!`, pasar la API key en el chat, o
  postergar el MCP) — quedó pausado para resolver primero este `render.yaml`.

## 0k. Migración de SQLite a PostgreSQL en la nube (Neon) (2026-08-04)

Resuelve el punto pendiente desde la sección 5 (había quedado en SQLite por
falta de Docker/Postgres local). Cambios:

- `backend/prisma/schema.prisma`: `datasource db { provider = "postgresql" }`
  — **sin** agregar `url = env("DATABASE_URL")` inline (a diferencia de lo
  sugerido literalmente): la URL ya la resuelve `prisma.config.ts`
  (`datasource.url: process.env["DATABASE_URL"]`), y duplicarla en el
  schema es redundante en el flujo de configuración de Prisma 7. Si en
  algún momento se saca `prisma.config.ts`, hay que agregar el `url` acá.
- `backend/.env`: `DATABASE_URL` reemplazada por la cadena de Neon provista
  por el usuario (host `ep-odd-queen-acouri0p-pooler.sa-east-1.aws.neon.tech`,
  db `neondb`). Sigue gitignoreada (`backend/.gitignore` ya tenía `.env`).
- `backend/src/prisma/prisma.service.ts` y `backend/prisma/seed.ts`:
  `PrismaBetterSqlite3` → `PrismaPg` (`@prisma/adapter-pg`, ya estaba
  instalado desde el arranque original del proyecto, nunca se desinstaló).
- `npx prisma generate` + `npx prisma db push` (creó todas las tablas en
  Neon, sin drift ni conflictos — la DB estaba vacía) + `npx prisma db seed`
  (27 insumos, 12 recetas, usuario Admin, y el resto del dataset de
  distribuidora de sesiones posteriores: proveedores, clientes, productos,
  compras, ventas, gastos, caja, personal).

**Verificado en caliente contra Neon** (no solo build): `npm run build`
limpio, backend levantado y probado con curl — login real, `GET /recipes`
devuelve las 12 recetas, `GET /dashboard/summary` calcula los KPIs
correctamente desde datos que ya viven en Neon.

**Nota**: `pg` tira un warning (no error) de deprecación sobre
`sslmode=require` — en `pg-connection-string`/`pg` v9 ese modo va a pasar a
significar `verify-full` (más estricto). Por ahora funciona sin problema;
si se quiere silenciar el warning, cambiar la connection string a
`uselibpqcompat=true&sslmode=require` (mantiene el comportamiento actual)
o a `sslmode=verify-full` (más estricto, requiere que el certificado de
Neon valide correctamente).

## 0j. Mapa de arquitectura por grafos (2026-08-04)

Se agregó `dependency-cruiser` en un `package.json` nuevo en la raíz del
repo (antes no existía ninguno ahí — solo `backend/` y
`erp-cocteleria-frontend/` tenían el suyo). Detalle completo de cómo usarlo
en `JAUMINA_WORKSPACE_RULES.md §16`.

**Problemas encontrados y resueltos en el camino:**
1. `npm install typescript` por defecto instaló la v7, pero
   dependency-cruiser 18.x solo soporta TypeScript `<7.0.0` — se pinneó a
   `^5.9.3`.
2. Pasar `tsConfig: { fileName: 'backend/tsconfig.json' }` desde la raíz
   tiraba `TS18003: No inputs were found` — TypeScript resuelve el
   `include` del tsconfig raro cuando el cwd de depcruise no coincide con
   la carpeta del tsconfig. Solución: el backend no usa path aliases, así
   que se le sacó el `tsConfig` a su config; el frontend sí los necesita
   (`@/*`), así que su script hace `cd erp-cocteleria-frontend &&` antes de
   correr depcruise, con `tsConfig: { fileName: 'tsconfig.json' }` (relativo
   al nuevo cwd).

**Pendiente / limitación conocida**: esta máquina no tiene Graphviz
instalado, así que no se generan imágenes `.svg`/`.png` del grafo — solo
`.dot` (texto) y `.json`. Si se quiere la imagen, instalar Graphviz y correr
`dot -Tsvg .graph/architecture-map.backend.dot -o backend-graph.svg` (o
frontend) a mano.

## 0i. Rediseño del Sidebar + Dashboard con endpoints directos (2026-08-04)

Pedido explícito del usuario, enfocado 100% en frontend:

- **Design tokens**: ya coincidían exactamente con lo pedido (#FFFFFF,
  #F8F9FA, #D4AF37, #F1ECE9, #2D2D2D en `globals.css`) — no hizo falta
  cambiar nada ahí.
- **Sidebar movido y reestructurado**: de `src/components/layout/Sidebar.tsx`
  (plano, 13 items) a `src/modules/shared/components/Sidebar.tsx` +
  `nav-items.ts` en la misma carpeta, ahora con 4 grupos (Principal,
  Operaciones, Finanzas, Administración). Se borró la ubicación vieja
  (`components/layout/Sidebar.tsx` y `nav-items.ts`) y se actualizó el
  import en `(app)/layout.tsx`.
- **Nav reorganizado según lo pedido por el usuario esta vez** (que en un
  par de puntos difiere del listado plano de
  `JAUMINA_WORKSPACE_RULES.md §9` — se siguió la instrucción explícita del
  mensaje, más reciente y específica, por sobre el documento):
  - "Productos" se sacó del sidebar (la página y ruta `/productos` siguen
    existiendo, solo no tienen link — Inventario ya muestra el stock por
    producto).
  - "Ventas" se renombró a **Ingresos** y se movió al grupo Finanzas — la
    carpeta pasó de `(app)/ventas` a `(app)/ingresos`; toda la lógica
    interna (llamadas a `getVentas`/`createVenta`/`anularVenta`, que pegan
    al backend en `/ventas`) quedó intacta, solo cambió la ruta/label.
  - **Eventos** (nuevo en el sidebar, real): página en `/eventos` con
    listado + alta, reutilizando el módulo `events` del backend que ya
    existía (nunca se había expuesto en el frontend). Incluye selección de
    recetas del menú al crear el evento; no incluye asignación de staff
    porque **no existe ningún endpoint para listar `Staff`** en el backend
    (el modelo existe pero solo se siembra por seed, no tiene controller) —
    si se quiere asignar staff desde el frontend hay que construir ese
    módulo primero.
  - **Servicios** (nuevo en el sidebar, stub): no hay modelo de datos ni
    endpoint en el backend para "Servicios" como concepto propio — quedó
    como pantalla "Módulo en construcción" (`ComingSoon`). Falta definir
    con el usuario qué es un "Servicio" en este negocio antes de diseñar el
    modelo (¿es lo mismo que `Producto`? ¿es dotación de staff/equipamiento
    por evento?).
- **Dashboard**: se agregaron dos paneles nuevos con fetch directo (no via
  `/dashboard/summary`), tal como se pidió:
  - Stock Crítico ahora sale de `GET /ingredients` (antes salía del
    `stockCritico` combinado de `/dashboard/summary`, que mezclaba
    `Ingredient` + `Producto`). El panel combinado sigue existiendo en el
    backend por si se necesita en otro lado, simplemente el dashboard ya no
    lo usa para esta sección.
  - Próximos Eventos (nuevo) sale de `GET /events`, filtrando por estado
    activo (COTIZADO/CONFIRMADO/EN_CURSO) y fecha futura, ordenado
    ascendente, top 5.
  - Los 4 KPIs, el gráfico Ingresos vs Gastos y Actividad Reciente se
    dejaron sin tocar (siguen viniendo de `/dashboard/summary`).
- Se corrigió un error de lint (`react-hooks/purity`, "Cannot call impure
  function during render") que apareció al comparar fechas contra
  `Date.now()` dentro de un `useMemo` — se resolvió con el mismo patrón que
  ya usaba `ReportesPage` (`useMemo(() => new Date(), [])`, calculado una
  sola vez).

**Verificado**: `npm run build` y `npm run lint` limpios; las 15 rutas del
sidebar + `/cotizador` devuelven 200; se confirmó con curl que
`GET /ingredients` y `GET /events` devuelven exactamente los datos que
consumen los paneles nuevos del dashboard.

## 0e. Cierre de esta pasada autónoma (2026-08-04)

`npm run lint` quedó limpio en backend y frontend (se corrigieron 2 errores
de variables sin usar en `productos.service.ts`/`ventas.service.ts`, y 2
errores de `react-hooks/set-state-in-effect` en `auth-context.tsx` y
`configuracion/page.tsx`, envolviendo el `setState` post-fetch en una
microtarea en vez de llamarlo directo en el cuerpo del efecto). Build y
smoke test repetidos después de los fixes — todo sigue funcionando
(venta de prueba y update de producto verificados por curl).

Servidores dejados corriendo: backend en `:4001`, frontend en `:3002`
(`npm run dev`, con hot-reload). Login de prueba:
`admin@cocteleriapremium.com` / `Admin123!`.

## 0f. Cotizador Inteligente conectado a datos reales (2026-08-04)

Se reemplazó el mock `QUOTE_RECIPES` (`lib/quote-data.ts`) por un fetch real
a `GET /recipes` (público, sin login) usando react-query. Cambios:
- `lib/quote.ts`: `computeQuote()` ahora recibe la lista de recetas
  disponibles como parámetro en vez de importar el mock.
- `lib/quote-data.ts`: solo quedan `DrinkCategory`, `DRINK_CATEGORIES` y
  `CONSUMPTION_RATIO` (genéricos); se borró el array `QUOTE_RECIPES`.
- `QuoteBuilder.tsx`: hace `useQuery(['recipes'], getRecipes)` y mapea el
  `Recipe` del backend (que ya tiene `category`/`price` desde la sesión
  anterior) a `QuoteRecipe`; muestra skeleton mientras carga.
- `DrinkPicker.tsx`: recibe `allRecipes` por prop en vez de importar el mock.

Verificado: `npm run build` y `npm run lint` limpios, y `grep` confirma que
no queda ninguna referencia a `QUOTE_RECIPES` en `src/`. El Cotizador ahora
muestra las 12 recetas reales del seed (Mojito, Old Fashioned, Negroni,
etc.) con sus precios calculados desde el escandallo.

## 0h. Fix del test e2e (2026-08-04)

Al correr `npm run test:e2e` por primera vez en esta sesión (no se había
corrido antes, solo build/lint) falló con `JWT_SECRET no está definido` —
`test/app.e2e-spec.ts` (scaffold original de NestJS, nunca tocado hasta
ahora) no cargaba `.env` antes de instanciar el `AppModule`. Se agregó
`import 'dotenv/config';` al inicio del archivo, igual que ya hacían
`main.ts` y `prisma/seed.ts`. `npm test` y `npm run test:e2e` pasan ahora.

## 0g. Anulación de Compras y Ventas (2026-08-04)

El schema ya tenía `status: ANULADA` en `Compra`/`Venta` pero no había forma
de setearlo. Se agregó:
- `PATCH /ventas/:id/anular` (ADMIN/COORDINADOR): repone el stock de cada
  item con un `MovimientoInventario` ENTRADA (origen MANUAL, reason
  "Anulación de venta"), rechaza con 400 si ya estaba anulada.
- `PATCH /compras/:id/anular` (solo ADMIN, por tocar el gasto): revierte el
  stock con `MovimientoInventario` SALIDA y hace soft-delete del `Gasto`
  automático vinculado (para que deje de contar en Dashboard/Reportes).
- Botón "Anular" (con confirm de navegador) en las tablas de `/ventas` y
  `/compras`, con el monto tachado cuando el registro está anulado.

Verificado con curl de punta a punta: crear venta → stock baja → anular →
stock vuelve al valor original → anular de nuevo → 400. Mismo patrón para
compra, verificando además que el conteo de `/gastos` vuelve a su valor
anterior tras la anulación. `npm run build` y `npm run lint` limpios en
ambos proyectos después del cambio.

**Nota de diseño**: anular una compra resta stock sin chequear si ese stock
ya fue vendido después (podría dejar el `Producto.stock` en negativo). Se
dejó así a propósito — un stock negativo es una señal honesta de que hay
que revisar esa cadena de eventos, mejor que ocultarlo con un clamp a 0.

**Lo que quedó sin hacer, para una próxima pasada (nada bloqueante):**
- Migrar los módulos viejos (`auth`, `users`, `ingredients`, `recipes`,
  `events`, `dashboard`, `prisma`, `common`) a `src/modules/...` (ver 0c).
- Paginación server-side en los listados (`GET /clientes`, `/productos`,
  etc. hoy devuelven todo sin límite — regla §12 "Paginación"). No es un
  problema al volumen de datos de este seed, pero sí lo sería en producción.
- Export a PDF real en Reportes (hoy solo CSV).
- Cancelación/anulación de Compras y Ventas (`status: ANULADA`) — el campo
  existe en el schema pero no hay endpoint para setearlo todavía.
- No se probó nada "a mano" en un navegador real (sin herramienta de
  automatización de UI en esta sesión): todo lo verificado fue vía
  `npm run build`, `npm run lint` y `curl` contra los endpoints reales.

## 0d. Reportes + Configuración (2026-08-04, mismo modo autónomo)

Se completaron los dos módulos que habían quedado como stub:

- **Configuración**: modelo `Empresa` (singleton — `getEmpresa()` lo crea con
  valores por defecto en el primer acceso si no existe ninguna fila).
  `GET /configuracion` para cualquier autenticado, `PATCH /configuracion`
  solo ADMIN. Frontend con formulario, campos deshabilitados si el usuario
  no es ADMIN.
- **Reportes**: filtro de rango de fechas sobre Ventas y Gastos (Compras se
  suma aparte), 3 totales (Ventas/Compras/Gastos del período), tabla de
  movimientos y botón "Descargar CSV" (generado 100% client-side con Blob,
  sin librerías nuevas). **No incluye export a PDF** — se evitó agregar una
  dependencia pesada (ej. `pdfkit`/`puppeteer`) sin que se pidiera
  explícitamente (regla §15 "evitar dependencias innecesarias"); si se
  quiere PDF real, es una tarea aparte a decidir con el usuario.
- Verificado con curl: `GET /configuracion` crea el singleton, `PATCH` lo
  actualiza; ambas rutas del frontend cargan (200).

Con esto, **las 13 rutas del sidebar de JAUMINA_WORKSPACE_RULES.md §9 ya
tienen una pantalla real** (ninguna quedó como "Módulo en construcción").

## 0c. Segunda "parte grande": módulos genéricos completos (2026-08-04, modo autónomo)

A partir de acá se trabajó **sin autorización previa por mensaje**, según lo
acordado ("segui sin mi autorización... hasta que terminen los tokens").
Se construyó, de punta a punta (schema + backend + seed + frontend):

- **Prisma**: modelos `Cliente`, `Proveedor`, `Producto`, `Compra`/
  `CompraItem`, `Venta`/`VentaItem`, `MovimientoInventario`, `Gasto`,
  `CajaSesion`, `Empleado`/`EmpleadoMovimiento`, todos con `deletedAt`
  (soft-delete) donde corresponde. Conviven con los modelos de coctelería
  sin tocarlos.
- **Backend** (`src/modules/...`, la convención correcta según regla §6 —
  ver nota de arquitectura más abajo): Clientes, Proveedores, Productos,
  Inventario, Compras, Ventas, Caja, Gastos, Personal, Auditoría. Todos
  protegidos con JWT + roles, todos loggeando en `AuditLog` vía un
  `AuditService` compartido (`src/shared/audit/`) para no duplicar esa
  lógica en cada módulo.
- **Automatizaciones reales (regla §8)**, verificadas con curl contra el
  servidor real:
  - `Compra` → incrementa `Producto.stock` + crea `MovimientoInventario`
    ENTRADA + crea `Gasto` automático (origin COMPRA) — todo en una sola
    transacción Prisma.
  - `Venta` → valida stock suficiente (400 si no alcanza), decrementa
    `Producto.stock` + crea `MovimientoInventario` SALIDA.
  - `Dashboard` → `getSummary()` ahora suma `Venta.totalAmount`/`paidAmount`
    y `Gasto.amount` a los KPIs de Ingresos/Gastos/Cobrado, además de los
    `Event` de coctelería que ya tenía. `stockCritico` combina `Ingredient`
    (coctelería) y `Producto` (genérico) en una sola lista.
- **Seed**: se agregó una distribuidora mayorista de ejemplo (proveedores,
  clientes, 10 productos tipo almacén/bebidas/limpieza, 3 compras, 6 ventas,
  2 gastos manuales, 2 sesiones de caja, 3 empleados con 2 adelantos/
  préstamos) — a propósito en **otro rubro** (no coctelería) para probar que
  el núcleo es reutilizable entre negocios, como pide la Visión del
  documento.
- **Frontend**: reemplazados los 9 stubs "Módulo en construcción" restantes
  con pantallas reales conectadas al backend (Clientes y Proveedores con
  detalle/historial en `/clientes/[id]` y `/proveedores/[id]`; Personal con
  legajo + adelantos en `/personal/[id]`; Productos, Inventario con ajuste
  manual de stock, Compras y Ventas con formularios de items dinámicos,
  Caja con apertura/cierre/arqueo, Gastos, Auditoría con filtro por entidad
  y paginación). Se agregaron 3 primitivas UI reutilizables
  (`components/ui/Modal.tsx`, `Field.tsx`, `styles.ts`) para no repetir
  estilos de formulario/botón en cada página. **Solo quedan como stub**:
  Reportes y Configuración (ver más abajo).

**Verificación realizada**: `npm run build` limpio en backend y frontend;
smoke test con curl de los 10 endpoints nuevos (incluyendo una compra y una
venta reales de prueba, y el rechazo 400 por stock insuficiente); las 15
rutas del sidebar devuelven 200 y su HTML no contiene marcadores de error de
React. **No se pudo probar en un navegador real** (sin herramienta de
automatización de browser disponible en esta sesión) — los formularios,
modales y mutaciones (crear cliente, registrar venta, etc.) no se hicieron
clic a clic, solo se verificó que las páginas cargan y que los endpoints que
consumen funcionan correctamente por su cuenta.

**Decisión de arquitectura (regla §6, `modules/shared/core/infrastructure`):**
los módulos nuevos SÍ se crearon en `src/modules/<nombre>/`, cumpliendo la
regla. Los módulos viejos (`auth`, `users`, `ingredients`, `recipes`,
`events`, `dashboard`, `prisma`, `common`) **no se migraron** a esa
estructura para no arriesgar una regresión mecánica grande sin nadie
revisando en tiempo real — quedan en `src/<nombre>/` como estaban. Recomendado
unificarlo en una pasada dedicada cuando se pueda revisar el resultado.

## 0b. Primera "parte grande" de Ja'umina: Design System + Layout + Dashboard (2026-08-04)

Implementado siguiendo `JAUMINA_WORKSPACE_RULES.md`:
- Design tokens **White Bloom & Gold** en `globals.css` (paper #FFFFFF/#F8F9FA,
  blush #F1ECE9, anthracite #2D2D2D, champagne gold #D4AF37 sin cambios). Los
  tokens oscuros legacy (`obsidian-*`, `ivory`, `smoke`, `.glass-panel`) se
  dejaron intactos, sin usarse como default, para no romper `/cotizador`.
- `/cotizador` (antes la home `/`): recetario coctelería con tema oscuro
  forzado localmente (`bg-obsidian-deep text-ivory` en el wrapper). `/` ahora
  redirige a `/dashboard`.
- Sidebar modular data-driven (`components/layout/nav-items.ts`) con los 13
  módulos de la regla §9. Layout `(app)/layout.tsx` con guard de auth
  (redirige a `/login` si no hay token) + Topbar con usuario/logout.
- Login mínimo (`/login`) — necesario para poder llamar endpoints protegidos
  del dashboard; no estaba pedido explícitamente pero es un requisito técnico
  duro para "conectar al backend".
- Dashboard (`/dashboard`): 4 KPIs en ₲ (Ingresos, Gastos, Margen, Cobrado),
  gráfico Recharts Ingresos vs Gastos por mes, panel Stock Crítico, panel
  Actividad Reciente. Todo con skeletons de carga y estados vacíos.
- Backend: nuevo módulo `dashboard` (`GET /dashboard/summary`, protegido por
  JWT) que calcula todo desde datos reales (Event/Staff/Recipe/Ingredient/
  AuditLog) — sin mocks en el frontend.
- Las otras 12 rutas del sidebar son stubs "Módulo en construcción"
  (`ComingSoon.tsx` reutilizable) para no dejar links rotos.
- **Bug encontrado y corregido**: CORS del backend apuntaba fijo a
  `localhost:3000`, pero el frontend corre en `:3002` en esta máquina (los
  puertos 3000/3001 los ocupan otros proyectos). Se cambió a una lista de
  orígenes configurable vía `FRONTEND_URL` (coma-separado), con default de
  varios puertos localhost comunes.

**Decisiones delicadas / deuda técnica que quedó pendiente a propósito:**
1. **No se migró la arquitectura backend a `src/modules/shared/core/
   infrastructure/lib/types`** (regla §6). El módulo `dashboard` nuevo se
   creó siguiendo la convención plana existente (`src/dashboard/`) para no
   arrancar un refactor grande y riesgoso de TODO el backend sin aprobación
   explícita. Recomendación: encarar esa reestructuración como su propia
   "parte grande", moviendo todos los módulos existentes a la vez.
2. **KPIs financieros (Ingresos/Gastos/Margen/Cobrado) se calculan a partir
   de los modelos `Event`/`Staff`/`Recipe`** (específicos de coctelería),
   porque los módulos genéricos Ventas/Gastos/Caja de la regla §9 todavía no
   existen. Es una solución puente: cuando se construyan esos módulos habrá
   que decidir si el dashboard pasa a leer de ahí en vez de `Event`.
3. **No hay escritura automática de Auditoría en cada mutación** (regla §8
   "una acción debe actualizar automáticamente los módulos relacionados").
   Hoy `AuditLog` solo tiene registros de seed; falta instrumentar
   `EventsService`/`RecipesService`/`IngredientsService` (y los futuros
   módulos) para que escriban un log real en cada create/update/delete.
4. **No se instaló Shadcn/UI** (pedido en stack §3). Se construyeron
   componentes propios (`KpiCard`, `Sidebar`, `ComingSoon`, inputs de
   `/login`) estilizados a mano con Tailwind sobre los tokens nuevos, para
   evitar la complejidad/tiempo del CLI de shadcn con Tailwind v4 en este
   entorno. Si se quiere shadcn "de verdad" (con sus primitivas Radix), es
   una tarea aparte.
5. Sigue pendiente lo de la sección 5b: DB en SQLite (no PostgreSQL), sin
   soft-delete (`deleted_at`), sin `numeric`/`timestamptz` — regla §7.

## 0. Pivote a Ja'umina ERP (2026-08-04)

El proyecto pasó a regirse por `JAUMINA_WORKSPACE_RULES.md` (ERP genérico
multi-rubro), que reemplaza a `WORKSPACE_RULES.md` (archivado en
`docs/WORKSPACE_RULES.coctelería.legacy.md`). Se acordó construir el nuevo
enfoque "por partes grandes" en sesiones sucesivas — todavía no se tocó
código a raíz de este pivote.

**Impacto pendiente de evaluar cuando se empiece a implementar:**
- El `schema.prisma` actual (User, Ingredient, Recipe, Event, Staff...) es
  100% específico de coctelería/eventos. Las nuevas reglas piden módulos
  genéricos (Clientes, Productos, Inventario, Compras, Ventas/POS, Caja,
  Gastos, Personal, Proveedores, Reportes, Auditoría, Configuración) con
  Soft Delete (`deleted_at`), `numeric` para dinero y `timestamptz` — hoy
  usamos `Float` para montos y SQLite (sin `numeric`/`timestamptz` nativos).
- El frontend (`erp-cocteleria-frontend/`) y el Cotizador Inteligente
  también son específicos del rubro coctelería/eventos.
- La estructura de carpetas pedida (`modules/`, `shared/`, `core/`,
  `infrastructure/`, `lib/`, `types/`) no existe todavía en ningún lado del
  repo.
- Nombre de proyecto: el doc habla de "Ja'umina ERP"; ya existe un directorio
  separado `C:\jaumina-erp` corriendo en el puerto 3001 con ese branding —
  el usuario confirmó que son cosas distintas y que este repo
  (`erp-distribuidora`) es el que adopta las reglas de Ja'umina, no ese otro
  directorio.

## 1. Base de datos: SQLite en vez de PostgreSQL

**Bloqueo encontrado:** no hay Docker instalado en esta máquina (`docker` no
existe en PATH) ni credenciales de un PostgreSQL remoto/dev en `.env`. El
`docker-compose.yml` del repo levanta Postgres, pero no se pudo ejecutar.

**Decisión tomada:** se cambió el datasource de `backend/prisma/schema.prisma`
a `sqlite`, con `@prisma/adapter-better-sqlite3` en `PrismaService` y
`prisma/seed.ts`. La base vive en `backend/prisma/dev.db` (vía
`DATABASE_URL="file:./dev.db"` en `backend/.env`).

**Para migrar a PostgreSQL en producción:**
1. Instalar Docker o conseguir credenciales de un Postgres gestionado.
2. `datasource db { provider = "postgresql" }` en `schema.prisma`.
3. Volver a `PrismaPg` (`@prisma/adapter-pg`, ya está instalado) en
   `prisma.service.ts` y `prisma/seed.ts`.
4. `DATABASE_URL` real en `.env` (el `docker-compose.yml` ya define
   `postgresql://postgres:postgres@localhost:5432/cocteleria_db`).
5. `npx prisma generate && npx prisma db push` (o `migrate dev` si se quiere
   versionar el historial de migraciones).

## 2. Puertos 3000/3001 ocupados por proyectos ajenos

Esta máquina tenía **otros dos proyectos no relacionados** corriendo en los
puertos por defecto:
- `:3000` → `C:\Users\alvar\hortimundo-sistema\frontend`
- `:3001` → `C:\jaumina-erp`

Para evitar choques, el backend de este proyecto quedó en **PORT=4001**
(`backend/.env`), y el frontend apunta ahí vía
`NEXT_PUBLIC_API_URL="http://localhost:4001"` (`erp-cocteleria-frontend/.env.local`).
Si esos otros procesos dejan de correr, se puede volver a 3001 sin problema.

## 3. Trabajo concurrente detectado en el frontend

Durante esta sesión se detectó **otro agente editando en vivo** los archivos
de `erp-cocteleria-frontend/` (design tokens, fuentes Outfit/Inter, header,
y un Cotizador Inteligente funcional con datos mock en
`src/lib/quote-data.ts` / `src/components/cotizador/*`). Por eso esta sesión
se limitó a **backend + una integración mínima y aditiva**, sin tocar
componentes ni el diseño ya construidos, para no pisar ese trabajo.

**Lo que quedó listo para conectar (no conectado aún):**
- `src/lib/api.ts` (nuevo, no toca nada existente): cliente tipado con
  `getRecipes()`, `login()`, `getMe()`, `getIngredients()`, `getEvents()`,
  `createEvent()` y `computeRecipeCost()`.
- `GET /recipes` y `GET /recipes/:id` en el backend ahora son **públicos**
  (decorador `@Public()` + bypass en `JwtAuthGuard`) para que el Cotizador
  pueda leer el recetario real sin login.

**Para terminar la integración real del Cotizador** (hoy usa
`QUOTE_RECIPES` mock):
1. En `QuoteBuilder.tsx` (o en `page.tsx` como Server Component), reemplazar
   el import de `QUOTE_RECIPES` por `getRecipes()` de `src/lib/api.ts`.
2. El modelo `Recipe` del backend **no tiene** `category` (Signature/
   Clásicos/Sin Alcohol/Shots) ni `price` — el mock del cotizador sí. Hay que
   decidir: (a) agregar `category` e.g. enum `DrinkCategory` y un campo
   `suggestedPrice` a `prisma/schema.prisma`, o (b) calcular el precio
   sugerido en el frontend con `computeRecipeCost()` (ya escrito en
   `lib/api.ts`) aplicando un margen, y ocultar/mapear categorías con una
   heurística. No se tomó esta decisión por ser un cambio de esquema que
   afecta directamente los archivos que el otro agente está editando.
3. El login (`POST /auth/login`) y el dashboard de eventos (`GET /events`,
   `POST /events`) no tienen pantalla propia todavía — se asumió que el otro
   agente los va a construir; si no es así, avisar para retomarlos.

## 4. Usuario Admin por defecto (seed)

```
email:    admin@cocteleriapremium.com
password: Admin123!
```

Creado por `backend/prisma/seed.ts` (`npx prisma db seed`). Cambiar la
contraseña antes de cualquier despliegue real.

## 5b. Recipe.category / Recipe.price agregados (2026-08-04)

Se agregó `enum DrinkCategory { SIGNATURE, CLASICOS, SIN_ALCOHOL, SHOTS }` y los
campos `category` (default `CLASICOS`) y `price` (`Int`, ₲) al modelo `Recipe`
en `schema.prisma`, con el mismo naming que `DrinkCategory`/`QuoteRecipe` del
frontend (`src/lib/quote-data.ts`). Aplicado con `prisma db push` (no
`migrate dev`: la DB ya tenía tablas creadas por `db push` sin historial de
migraciones, y `migrate dev` pedía resetearla — se evitó para no perder el
seed). `CreateRecipeDto`/`UpdateRecipeDto` actualizados con `category`/`price`
opcionales.

`prisma/seed.ts` ahora calcula `price` automáticamente por receta:
`costo_escandallo × 4.5`, redondeado a ₲500 (`SUGGESTED_PRICE_MARKUP` /
`PRICE_ROUNDING` en el propio archivo). De las 12 recetas, "Old Fashioned" y
"Negroni" quedaron como `SIGNATURE`; el resto `CLASICOS`. No hay ninguna
receta seedeada en `SIN_ALCOHOL` ni `SHOTS` todavía — el enum ya las soporta,
falta cargar ejemplos si se quiere ese filtro poblado en el Cotizador.

Verificado con `GET /recipes` (server temporal en :4001): los 12 registros
devuelven `category` y `price` correctamente.

**Frontend:** `src/lib/api.ts` (`Recipe` interface) todavía no tiene
`category`/`price` — falta agregarlos ahí y en el fetch real que reemplace
`QUOTE_RECIPES` (ver sección 3).

## 6. Redis / BullMQ

El backend tiene `@nestjs/bullmq` y `bullmq` instalados y `docker-compose.yml`
levanta Redis, pero no hay ningún módulo que efectivamente los use todavía
(no se encontró ninguna cola/worker en `backend/src`). No es un bloqueo, solo
queda pendiente si se planea usar colas (ej. envío de cotizaciones, recordatorios).
