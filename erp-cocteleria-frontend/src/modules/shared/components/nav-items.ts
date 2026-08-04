import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingCart,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Receipt,
  Wallet,
  IdCard,
  Truck,
  FileBarChart,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Navegación agrupada del ERP — definida junto con el usuario para esta
// pasada de frontend (extiende, y en un par de casos reemplaza en el
// sidebar, el listado plano de JAUMINA_WORKSPACE_RULES.md §9; ver
// PENDIENTES.md para el detalle de qué cambió y por qué).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [{ label: 'Resumen', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Inventario', href: '/inventario', icon: Boxes },
      { label: 'Compras', href: '/compras', icon: ShoppingCart },
      { label: 'Eventos', href: '/eventos', icon: CalendarDays },
      { label: 'Servicios', href: '/servicios', icon: Sparkles },
      { label: 'Clientes', href: '/clientes', icon: Users },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Ingresos', href: '/ingresos', icon: TrendingUp },
      { label: 'Gastos', href: '/gastos', icon: Receipt },
    ],
  },
  {
    label: 'Administración',
    items: [
      { label: 'Caja', href: '/caja', icon: Wallet },
      { label: 'Personal', href: '/personal', icon: IdCard },
      { label: 'Proveedores', href: '/proveedores', icon: Truck },
      { label: 'Reportes', href: '/reportes', icon: FileBarChart },
      { label: 'Auditoría', href: '/auditoria', icon: ShieldCheck },
      { label: 'Configuración', href: '/configuracion', icon: Settings },
    ],
  },
];
