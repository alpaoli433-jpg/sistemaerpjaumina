# JAUMINA_WORKSPACE_RULES.md

**Proyecto:** Ja'umina ERP
**Versión:** 1.0
**Objetivo:** Definir los estándares de arquitectura, desarrollo y calidad del proyecto.

---

## 1. Visión

Ja'umina ERP es un sistema de gestión empresarial modular, escalable y
reutilizable para pequeñas y medianas empresas. El sistema debe diseñarse
para adaptarse a distintos rubros mediante configuración, evitando lógica
específica del negocio en el núcleo.

## 2. Objetivos

- Arquitectura limpia y mantenible.
- Código desacoplado.
- Escalabilidad.
- Alto rendimiento.
- Seguridad por diseño.
- Excelente experiencia de usuario.

## 3. Stack Tecnológico

- **Frontend:** Next.js 15 + React + TypeScript
- **UI:** Tailwind CSS + Shadcn/UI
- **Animaciones:** Framer Motion
- **Backend:** Framework Node.js moderno (independiente de proveedor)
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **PWA**
- **Mobile First**

## 4. Principios

- Nunca duplicar lógica.
- Aplicar SOLID.
- Separar presentación, negocio y persistencia.
- Todos los módulos deben ser reutilizables.

## 5. Convenciones

### Código
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### Git
- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `chore:`

## 6. Arquitectura

```
src/
├── modules/
├── shared/
├── core/
├── infrastructure/
├── lib/
└── types/
```

Cada módulo debe ser independiente.

## 7. Base de Datos

- PostgreSQL normalizado.
- Foreign Keys.
- Índices.
- Soft Delete (`deleted_at`).
- `created_at` / `updated_at`.
- `numeric` para dinero.
- `timestamptz` para fechas.

## 8. Automatizaciones

Una acción debe actualizar automáticamente los módulos relacionados.

Ejemplo:

- Compra → Inventario → Gastos → Dashboard → Auditoría
- Venta → Inventario → Ingresos → Cliente → Dashboard → Auditoría

## 9. Módulos

- **Dashboard**: KPIs, Alertas, Actividad reciente, Indicadores financieros
- **Clientes**: Historial, Compras, Ventas, Facturas, Deudas
- **Productos**: Categorías, Código, Stock, Precios
- **Inventario**: Entradas, Salidas, Ajustes, Historial
- **Compras**: Proveedores, Facturas, Costos
- **Ventas (POS)**: Cliente, Productos, Pago, Facturación
- **Caja**: Apertura, Cierre, Arqueo
- **Gastos**: Manuales, Automáticos
- **Personal**: Legajos, Recibos, Adelantos, Préstamos
- **Proveedores**: Historial, Saldos
- **Reportes**: PDF, Excel, Filtros
- **Auditoría**: Registrar usuario, fecha, acción, tabla
- **Configuración**: Empresa, Preferencias del sistema

## 10. Seguridad

- Variables sensibles solo mediante entorno.
- Validación de entrada.
- Autenticación explícita en cada endpoint de API.
- Logs de acciones.

## 11. UX

- Mobile First.
- Skeletons.
- Estados vacíos amigables.
- Mensajes de error claros.

## 12. Performance

- Evitar consultas N+1.
- Paginación.
- Lazy Loading.
- Caché cuando corresponda.

## 13. Calidad

Antes de cerrar una tarea verificar:

- Compila.
- Sin errores.
- Sin código duplicado.
- Documentación actualizada.

## 14. Roadmap

**v1**
- Inventario
- Compras
- Ventas
- Clientes
- Caja
- Reportes

**v2**
- Facturación electrónica
- API

**v3**
- App móvil
- Integraciones bancarias
- BI
- IA

## 15. Reglas para Claude Code

- No modificar módulos existentes sin necesidad.
- Mantener compatibilidad.
- Priorizar estabilidad.
- Explicar decisiones importantes.
- Documentar cambios relevantes.
- Evitar dependencias innecesarias.

---

> Este documento reemplaza a `WORKSPACE_RULES.md` (enfoque específico de
> coctelería) como fuente de verdad definitiva del proyecto. Se irá
> completando y ampliando por partes grandes en sesiones sucesivas.
> El archivo anterior queda archivado en `docs/WORKSPACE_RULES.coctelería.legacy.md`
> como referencia histórica.
