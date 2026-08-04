const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? res.statusText, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export type Role = 'ADMIN' | 'COORDINADOR' | 'BARTENDER';
export type Unit = 'ML' | 'GRAMOS' | 'UNIDADES' | 'KILOS';

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  stock: number;
  minStock: number;
  costPerUnit: number;
}

export interface RecipeIngredient {
  id: string;
  quantity: number;
  ingredient: Ingredient;
}

export type DrinkCategory = 'SIGNATURE' | 'CLASICOS' | 'SIN_ALCOHOL' | 'SHOTS';

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  glassware: string;
  category: DrinkCategory;
  price: number;
  prepTimeSec: number;
  ingredients: RecipeIngredient[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// GET /recipes es público (no requiere token) — alimenta el Cotizador Inteligente.
export function getRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('/recipes');
}

export function getRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`);
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getIngredients(token: string): Promise<Ingredient[]> {
  return request<Ingredient[]>('/ingredients', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

interface EventPayload {
  title: string;
  clientName: string;
  clientPhone?: string;
  location: string;
  eventDate: string;
  guestsCount: number;
  serviceHours?: number;
  totalAmount?: number;
  depositPaid?: number;
  recipeIds?: string[];
  staffIds?: string[];
}

export type EventStatus = 'COTIZADO' | 'CONFIRMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';

export interface EventRecord {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string | null;
  location: string;
  eventDate: string;
  guestsCount: number;
  serviceHours: number;
  status: EventStatus;
  totalAmount: number;
  depositPaid: number;
  drinks: Array<{ id: string; recipeId: string; recipe: Recipe }>;
  staff: Array<{
    id: string;
    staffId: string;
    staff: { id: string; name: string; role: string; dailyRate: number; phone: string | null };
  }>;
}

export function getEvents(token: string): Promise<EventRecord[]> {
  return request<EventRecord[]>('/events', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createEvent(token: string, payload: EventPayload): Promise<EventRecord> {
  return request<EventRecord>('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// Costo escandallo (₲) de una receta: suma de cada insumo × su costo unitario.
export function computeRecipeCost(recipe: Recipe): number {
  return recipe.ingredients.reduce(
    (sum, item) => sum + item.quantity * item.ingredient.costPerUnit,
    0,
  );
}

export interface DashboardKpis {
  ingresos: number;
  gastos: number;
  margen: number;
  cobrado: number;
  eventosActivos: number;
}

export interface DashboardChartPoint {
  month: string;
  ingresos: number;
  gastos: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface StockCriticoItem {
  id: string;
  name: string;
  unit: Unit;
  stock: number;
  minStock: number;
  source: 'ingredient' | 'producto';
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  chart: DashboardChartPoint[];
  stockCritico: StockCriticoItem[];
  actividadReciente: AuditLogEntry[];
}

export function getDashboardSummary(token: string): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary', {
    headers: authHeaders(token),
  });
}

// ============================================================
// Ja'umina ERP genérico (Clientes, Proveedores, Productos, Inventario,
// Compras, Ventas, Caja, Gastos, Personal, Auditoría)
// ============================================================

export interface Cliente {
  id: string;
  name: string;
  documento: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

export interface ClienteConVentas extends Cliente {
  ventas: Venta[];
}

export interface CreateClientePayload {
  name: string;
  documento?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export function getClientes(token: string): Promise<Cliente[]> {
  return request<Cliente[]>('/clientes', { headers: authHeaders(token) });
}

export function getCliente(token: string, id: string): Promise<ClienteConVentas> {
  return request<ClienteConVentas>(`/clientes/${id}`, { headers: authHeaders(token) });
}

export function createCliente(token: string, payload: CreateClientePayload): Promise<Cliente> {
  return request<Cliente>('/clientes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface Proveedor {
  id: string;
  name: string;
  documento: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

export interface ProveedorConCompras extends Proveedor {
  compras: Compra[];
}

export interface CreateProveedorPayload {
  name: string;
  documento?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export function getProveedores(token: string): Promise<Proveedor[]> {
  return request<Proveedor[]>('/proveedores', { headers: authHeaders(token) });
}

export function getProveedor(token: string, id: string): Promise<ProveedorConCompras> {
  return request<ProveedorConCompras>(`/proveedores/${id}`, { headers: authHeaders(token) });
}

export function createProveedor(
  token: string,
  payload: CreateProveedorPayload,
): Promise<Proveedor> {
  return request<Proveedor>('/proveedores', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface Producto {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  unit: Unit;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
}

export interface CreateProductoPayload {
  name: string;
  code?: string;
  category?: string;
  unit?: Unit;
  costPrice?: number;
  salePrice?: number;
  stock?: number;
  minStock?: number;
}

export function getProductos(token: string): Promise<Producto[]> {
  return request<Producto[]>('/productos', { headers: authHeaders(token) });
}

export function createProducto(token: string, payload: CreateProductoPayload): Promise<Producto> {
  return request<Producto>('/productos', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export type MovimientoTipo = 'ENTRADA' | 'SALIDA' | 'AJUSTE';
export type MovimientoOrigen = 'COMPRA' | 'VENTA' | 'MANUAL';

export interface MovimientoInventario {
  id: string;
  productoId: string;
  tipo: MovimientoTipo;
  origen: MovimientoOrigen;
  quantity: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
  producto: Producto;
}

export interface CreateMovimientoPayload {
  productoId: string;
  tipo: MovimientoTipo;
  quantity: number;
  reason?: string;
}

export function getMovimientosInventario(token: string): Promise<MovimientoInventario[]> {
  return request<MovimientoInventario[]>('/inventario/movimientos', {
    headers: authHeaders(token),
  });
}

export function registrarMovimientoInventario(
  token: string,
  payload: CreateMovimientoPayload,
): Promise<{ producto: Producto; movimiento: MovimientoInventario }> {
  return request('/inventario/movimientos', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface CompraItem {
  id: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  producto: Producto;
}

export type CompraStatus = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

export interface Compra {
  id: string;
  invoiceNumber: string | null;
  purchaseDate: string;
  status: CompraStatus;
  totalAmount: number;
  notes: string | null;
  proveedor: Proveedor;
  items: CompraItem[];
  gasto: Gasto | null;
}

export interface CreateCompraPayload {
  proveedorId: string;
  invoiceNumber?: string;
  purchaseDate?: string;
  notes?: string;
  items: Array<{ productoId: string; quantity: number; unitCost: number }>;
}

export function getCompras(token: string): Promise<Compra[]> {
  return request<Compra[]>('/compras', { headers: authHeaders(token) });
}

export function createCompra(token: string, payload: CreateCompraPayload): Promise<Compra> {
  return request<Compra>('/compras', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function anularCompra(token: string, id: string): Promise<Compra> {
  return request<Compra>(`/compras/${id}/anular`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export interface VentaItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  producto: Producto;
}

export type VentaStatus = 'PAGADA' | 'PENDIENTE' | 'ANULADA';

export interface Venta {
  id: string;
  saleDate: string;
  status: VentaStatus;
  totalAmount: number;
  paidAmount: number;
  notes: string | null;
  cliente: Cliente | null;
  items: VentaItem[];
}

export interface CreateVentaPayload {
  clienteId?: string;
  status?: VentaStatus;
  paidAmount?: number;
  notes?: string;
  items: Array<{ productoId: string; quantity: number; unitPrice?: number }>;
}

export function getVentas(token: string): Promise<Venta[]> {
  return request<Venta[]>('/ventas', { headers: authHeaders(token) });
}

export function createVenta(token: string, payload: CreateVentaPayload): Promise<Venta> {
  return request<Venta>('/ventas', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function anularVenta(token: string, id: string): Promise<Venta> {
  return request<Venta>(`/ventas/${id}/anular`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export type CajaEstado = 'ABIERTA' | 'CERRADA';

export interface CajaSesion {
  id: string;
  openedAt: string;
  closedAt: string | null;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  status: CajaEstado;
  notes: string | null;
}

export function getSesionesCaja(token: string): Promise<CajaSesion[]> {
  return request<CajaSesion[]>('/caja/sesiones', { headers: authHeaders(token) });
}

export function getCajaActual(token: string): Promise<CajaSesion | null> {
  return request<CajaSesion | null>('/caja/actual', { headers: authHeaders(token) });
}

export function abrirCaja(
  token: string,
  payload: { openingAmount: number; notes?: string },
): Promise<CajaSesion> {
  return request<CajaSesion>('/caja/abrir', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function cerrarCaja(
  token: string,
  id: string,
  payload: { closingAmount: number; notes?: string },
): Promise<CajaSesion> {
  return request<CajaSesion>(`/caja/${id}/cerrar`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export type GastoOrigen = 'MANUAL' | 'COMPRA';

export interface Gasto {
  id: string;
  description: string;
  category: string | null;
  amount: number;
  origin: GastoOrigen;
  expenseDate: string;
  compra?: (Compra & { proveedor: Proveedor }) | null;
}

export interface CreateGastoPayload {
  description: string;
  category?: string;
  amount: number;
  expenseDate?: string;
}

export function getGastos(token: string): Promise<Gasto[]> {
  return request<Gasto[]>('/gastos', { headers: authHeaders(token) });
}

export function createGasto(token: string, payload: CreateGastoPayload): Promise<Gasto> {
  return request<Gasto>('/gastos', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export type EmpleadoEstado = 'ACTIVO' | 'INACTIVO';
export type EmpleadoMovimientoTipo = 'ADELANTO' | 'PRESTAMO';

export interface EmpleadoMovimiento {
  id: string;
  tipo: EmpleadoMovimientoTipo;
  amount: number;
  date: string;
  notes: string | null;
}

export interface Empleado {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  salary: number;
  hireDate: string;
  status: EmpleadoEstado;
}

export interface EmpleadoConMovimientos extends Empleado {
  movimientos: EmpleadoMovimiento[];
}

export interface CreateEmpleadoPayload {
  name: string;
  position: string;
  phone?: string;
  salary?: number;
  hireDate?: string;
  status?: EmpleadoEstado;
}

export function getEmpleados(token: string): Promise<Empleado[]> {
  return request<Empleado[]>('/personal', { headers: authHeaders(token) });
}

export function getEmpleado(token: string, id: string): Promise<EmpleadoConMovimientos> {
  return request<EmpleadoConMovimientos>(`/personal/${id}`, { headers: authHeaders(token) });
}

export function createEmpleado(token: string, payload: CreateEmpleadoPayload): Promise<Empleado> {
  return request<Empleado>('/personal', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function addMovimientoEmpleado(
  token: string,
  empleadoId: string,
  payload: { tipo: EmpleadoMovimientoTipo; amount: number; date?: string; notes?: string },
): Promise<EmpleadoMovimiento> {
  return request<EmpleadoMovimiento>(`/personal/${empleadoId}/movimientos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface AuditoriaPage {
  data: AuditLogEntry[];
  total: number;
  take: number;
  skip: number;
}

export interface Empresa {
  id: string;
  name: string;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
}

export interface UpdateEmpresaPayload {
  name?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  currency?: string;
}

export function getEmpresa(token: string): Promise<Empresa> {
  return request<Empresa>('/configuracion', { headers: authHeaders(token) });
}

export function updateEmpresa(token: string, payload: UpdateEmpresaPayload): Promise<Empresa> {
  return request<Empresa>('/configuracion', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function getAuditoria(
  token: string,
  params?: { entity?: string; action?: string; take?: number; skip?: number },
): Promise<AuditoriaPage> {
  const query = new URLSearchParams();
  if (params?.entity) query.set('entity', params.entity);
  if (params?.action) query.set('action', params.action);
  if (params?.take) query.set('take', String(params.take));
  if (params?.skip) query.set('skip', String(params.skip));
  const qs = query.toString();
  return request<AuditoriaPage>(`/auditoria${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(token),
  });
}
