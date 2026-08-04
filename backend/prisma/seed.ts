import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Unit, DrinkCategory, EventStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SALT_ROUNDS = 10;

// Margen aplicado sobre el costo del escandallo para obtener el precio sugerido.
const SUGGESTED_PRICE_MARKUP = 4.5;
const PRICE_ROUNDING = 500; // Redondeo al ₲500 más cercano

const INGREDIENTS: Array<{
  name: string;
  unit: Unit;
  stock: number;
  minStock: number;
  costPerUnit: number;
}> = [
  { name: 'Ron Blanco', unit: Unit.ML, stock: 6000, minStock: 1500, costPerUnit: 45 },
  { name: 'Ron Añejo', unit: Unit.ML, stock: 3000, minStock: 1000, costPerUnit: 60 },
  { name: 'Vodka', unit: Unit.ML, stock: 6000, minStock: 1500, costPerUnit: 50 },
  { name: 'Gin', unit: Unit.ML, stock: 4000, minStock: 1000, costPerUnit: 65 },
  { name: 'Tequila Blanco', unit: Unit.ML, stock: 3000, minStock: 1000, costPerUnit: 70 },
  { name: 'Whisky Bourbon', unit: Unit.ML, stock: 3000, minStock: 1000, costPerUnit: 80 },
  { name: 'Aperol', unit: Unit.ML, stock: 2000, minStock: 500, costPerUnit: 55 },
  { name: 'Campari', unit: Unit.ML, stock: 2000, minStock: 500, costPerUnit: 58 },
  { name: 'Vermut Rojo', unit: Unit.ML, stock: 2000, minStock: 500, costPerUnit: 40 },
  { name: 'Triple Sec', unit: Unit.ML, stock: 2000, minStock: 500, costPerUnit: 42 },
  { name: 'Jugo de Limón', unit: Unit.ML, stock: 5000, minStock: 1000, costPerUnit: 8 },
  { name: 'Jugo de Lima', unit: Unit.ML, stock: 5000, minStock: 1000, costPerUnit: 8 },
  { name: 'Jugo de Naranja', unit: Unit.ML, stock: 4000, minStock: 1000, costPerUnit: 10 },
  { name: 'Jugo de Piña', unit: Unit.ML, stock: 4000, minStock: 1000, costPerUnit: 12 },
  { name: 'Crema de Coco', unit: Unit.ML, stock: 2000, minStock: 500, costPerUnit: 18 },
  { name: 'Azúcar', unit: Unit.GRAMOS, stock: 5000, minStock: 1000, costPerUnit: 5 },
  { name: 'Almíbar (Simple Syrup)', unit: Unit.ML, stock: 3000, minStock: 500, costPerUnit: 6 },
  { name: 'Angostura Bitters', unit: Unit.ML, stock: 80, minStock: 100, costPerUnit: 120 },
  { name: 'Agua Tónica', unit: Unit.ML, stock: 8000, minStock: 2000, costPerUnit: 9 },
  { name: 'Soda', unit: Unit.ML, stock: 8000, minStock: 2000, costPerUnit: 6 },
  { name: 'Coca-Cola', unit: Unit.ML, stock: 8000, minStock: 2000, costPerUnit: 7 },
  { name: 'Prosecco', unit: Unit.ML, stock: 4000, minStock: 1000, costPerUnit: 45 },
  { name: 'Hierbabuena / Menta', unit: Unit.UNIDADES, stock: 35, minStock: 50, costPerUnit: 150 },
  { name: 'Hielo', unit: Unit.KILOS, stock: 7, minStock: 10, costPerUnit: 3500 },
  { name: 'Rodaja de Naranja', unit: Unit.UNIDADES, stock: 200, minStock: 30, costPerUnit: 200 },
  { name: 'Rodaja de Lima', unit: Unit.UNIDADES, stock: 200, minStock: 30, costPerUnit: 150 },
  { name: 'Cereza al Marrasquino', unit: Unit.UNIDADES, stock: 18, minStock: 30, costPerUnit: 300 },
];

const RECIPES: Array<{
  name: string;
  description: string;
  glassware: string;
  category: DrinkCategory;
  prepTimeSec: number;
  ingredients: Array<{ name: string; quantity: number }>;
}> = [
  {
    name: 'Mojito',
    description: 'Clásico cubano refrescante con ron blanco, menta y lima.',
    glassware: 'Vaso Highball',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 120,
    ingredients: [
      { name: 'Ron Blanco', quantity: 45 },
      { name: 'Jugo de Lima', quantity: 30 },
      { name: 'Azúcar', quantity: 15 },
      { name: 'Hierbabuena / Menta', quantity: 8 },
      { name: 'Soda', quantity: 60 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
  {
    name: 'Caipirinha',
    description: 'El trago nacional brasileño con cachaça (usamos ron blanco), lima y azúcar.',
    glassware: 'Vaso Old Fashioned',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 90,
    ingredients: [
      { name: 'Ron Blanco', quantity: 60 },
      { name: 'Rodaja de Lima', quantity: 4 },
      { name: 'Azúcar', quantity: 20 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
  {
    name: 'Margarita',
    description: 'Tequila, triple sec y limón en perfecto equilibrio agridulce.',
    glassware: 'Copa Margarita',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 90,
    ingredients: [
      { name: 'Tequila Blanco', quantity: 50 },
      { name: 'Triple Sec', quantity: 20 },
      { name: 'Jugo de Limón', quantity: 25 },
      { name: 'Hielo', quantity: 0.15 },
    ],
  },
  {
    name: 'Daiquiri',
    description: 'Ron, lima y azúcar. Simple, elegante, atemporal.',
    glassware: 'Copa Coupe',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 75,
    ingredients: [
      { name: 'Ron Blanco', quantity: 50 },
      { name: 'Jugo de Lima', quantity: 25 },
      { name: 'Almíbar (Simple Syrup)', quantity: 15 },
      { name: 'Hielo', quantity: 0.15 },
    ],
  },
  {
    name: 'Old Fashioned',
    description: 'Whisky bourbon, azúcar y angostura bitters. El original.',
    glassware: 'Vaso Old Fashioned',
    category: DrinkCategory.SIGNATURE,
    prepTimeSec: 100,
    ingredients: [
      { name: 'Whisky Bourbon', quantity: 60 },
      { name: 'Azúcar', quantity: 10 },
      { name: 'Angostura Bitters', quantity: 3 },
      { name: 'Rodaja de Naranja', quantity: 1 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
  {
    name: 'Negroni',
    description: 'Gin, Campari y vermut rojo en partes iguales.',
    glassware: 'Vaso Old Fashioned',
    category: DrinkCategory.SIGNATURE,
    prepTimeSec: 80,
    ingredients: [
      { name: 'Gin', quantity: 30 },
      { name: 'Campari', quantity: 30 },
      { name: 'Vermut Rojo', quantity: 30 },
      { name: 'Rodaja de Naranja', quantity: 1 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
  {
    name: 'Gin Tonic',
    description: 'Gin premium con tónica y un toque cítrico.',
    glassware: 'Copa Balón',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 60,
    ingredients: [
      { name: 'Gin', quantity: 50 },
      { name: 'Agua Tónica', quantity: 150 },
      { name: 'Rodaja de Lima', quantity: 1 },
      { name: 'Hielo', quantity: 0.25 },
    ],
  },
  {
    name: 'Cosmopolitan',
    description: 'Vodka, triple sec, jugo de lima y un toque de arándano.',
    glassware: 'Copa Coupe',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 90,
    ingredients: [
      { name: 'Vodka', quantity: 45 },
      { name: 'Triple Sec', quantity: 15 },
      { name: 'Jugo de Lima', quantity: 15 },
      { name: 'Hielo', quantity: 0.15 },
    ],
  },
  {
    name: 'Piña Colada',
    description: 'Ron, crema de coco y jugo de piña. Tropical y cremoso.',
    glassware: 'Copa Hurricane',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 100,
    ingredients: [
      { name: 'Ron Blanco', quantity: 45 },
      { name: 'Crema de Coco', quantity: 30 },
      { name: 'Jugo de Piña', quantity: 90 },
      { name: 'Hielo', quantity: 0.25 },
    ],
  },
  {
    name: 'Whiskey Sour',
    description: 'Bourbon, limón y azúcar con espuma sedosa.',
    glassware: 'Vaso Old Fashioned',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 90,
    ingredients: [
      { name: 'Whisky Bourbon', quantity: 60 },
      { name: 'Jugo de Limón', quantity: 25 },
      { name: 'Almíbar (Simple Syrup)', quantity: 15 },
      { name: 'Cereza al Marrasquino', quantity: 1 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
  {
    name: 'Aperol Spritz',
    description: 'Aperol, prosecco y soda. El aperitivo italiano por excelencia.',
    glassware: 'Copa Balón',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 60,
    ingredients: [
      { name: 'Aperol', quantity: 60 },
      { name: 'Prosecco', quantity: 90 },
      { name: 'Soda', quantity: 30 },
      { name: 'Rodaja de Naranja', quantity: 1 },
      { name: 'Hielo', quantity: 0.25 },
    ],
  },
  {
    name: 'Cuba Libre',
    description: 'Ron añejo, cola y un toque de lima.',
    glassware: 'Vaso Highball',
    category: DrinkCategory.CLASICOS,
    prepTimeSec: 50,
    ingredients: [
      { name: 'Ron Añejo', quantity: 50 },
      { name: 'Coca-Cola', quantity: 150 },
      { name: 'Rodaja de Lima', quantity: 1 },
      { name: 'Hielo', quantity: 0.2 },
    ],
  },
];

const STAFF: Array<{
  name: string;
  role: string;
  dailyRate: number;
  phone: string;
}> = [
  { name: 'Diego Martínez', role: 'Head Bartender', dailyRate: 450000, phone: '0981-111222' },
  { name: 'Lucía Fernández', role: 'Coctelera VIP', dailyRate: 400000, phone: '0981-333444' },
  { name: 'Andrés Gómez', role: 'Barback', dailyRate: 220000, phone: '0981-555666' },
  { name: 'Valentina Ríos', role: 'Coctelera VIP', dailyRate: 400000, phone: '0981-777888' },
];

const EVENTS: Array<{
  title: string;
  clientName: string;
  clientPhone: string;
  location: string;
  eventDate: Date;
  guestsCount: number;
  serviceHours: number;
  status: EventStatus;
  totalAmount: number;
  depositPaid: number;
  recipeNames: string[];
  staffNames: string[];
}> = [
  {
    title: 'Casamiento Benítez - Salón Aurora',
    clientName: 'Marcela Benítez',
    clientPhone: '0981-201122',
    location: 'Salón Aurora, Asunción',
    eventDate: new Date('2026-05-12T19:00:00'),
    guestsCount: 120,
    serviceHours: 6,
    status: EventStatus.FINALIZADO,
    totalAmount: 9800000,
    depositPaid: 9800000,
    recipeNames: ['Mojito', 'Margarita', 'Gin Tonic'],
    staffNames: ['Diego Martínez', 'Andrés Gómez'],
  },
  {
    title: 'Cumpleaños 40 Sosa',
    clientName: 'Ramón Sosa',
    clientPhone: '0981-202233',
    location: 'Quinta Los Aromos, Luque',
    eventDate: new Date('2026-06-02T20:00:00'),
    guestsCount: 60,
    serviceHours: 5,
    status: EventStatus.FINALIZADO,
    totalAmount: 4600000,
    depositPaid: 4600000,
    recipeNames: ['Old Fashioned', 'Whiskey Sour'],
    staffNames: ['Lucía Fernández'],
  },
  {
    title: 'Evento corporativo Itaú',
    clientName: 'Banco Itaú Paraguay',
    clientPhone: '021-555000',
    location: 'Hotel Sheraton, Asunción',
    eventDate: new Date('2026-06-10T18:30:00'),
    guestsCount: 200,
    serviceHours: 4,
    status: EventStatus.CANCELADO,
    totalAmount: 15000000,
    depositPaid: 3000000,
    recipeNames: ['Aperol Spritz', 'Negroni'],
    staffNames: ['Diego Martínez', 'Valentina Ríos'],
  },
  {
    title: 'Aniversario López-Cáceres',
    clientName: 'Familia López-Cáceres',
    clientPhone: '0981-203344',
    location: 'Club Centenario, Asunción',
    eventDate: new Date('2026-06-20T19:30:00'),
    guestsCount: 80,
    serviceHours: 5,
    status: EventStatus.FINALIZADO,
    totalAmount: 6200000,
    depositPaid: 6200000,
    recipeNames: ['Daiquiri', 'Piña Colada', 'Cuba Libre'],
    staffNames: ['Andrés Gómez', 'Valentina Ríos'],
  },
  {
    title: 'Casamiento Duarte - Estancia Yvoty',
    clientName: 'Sofía Duarte',
    clientPhone: '0981-204455',
    location: 'Estancia Yvoty, San Bernardino',
    eventDate: new Date('2026-07-05T18:00:00'),
    guestsCount: 150,
    serviceHours: 7,
    status: EventStatus.FINALIZADO,
    totalAmount: 12500000,
    depositPaid: 12500000,
    recipeNames: ['Mojito', 'Old Fashioned', 'Cosmopolitan'],
    staffNames: ['Diego Martínez', 'Lucía Fernández', 'Andrés Gómez'],
  },
  {
    title: 'Fiesta egresados CNU',
    clientName: 'Comisión de Egresados CNU',
    clientPhone: '0981-205566',
    location: 'Jockey Club, Asunción',
    eventDate: new Date('2026-07-18T21:00:00'),
    guestsCount: 180,
    serviceHours: 6,
    status: EventStatus.FINALIZADO,
    totalAmount: 10400000,
    depositPaid: 10400000,
    recipeNames: ['Cuba Libre', 'Margarita', 'Gin Tonic'],
    staffNames: ['Lucía Fernández', 'Valentina Ríos'],
  },
  {
    title: 'Cumpleaños 15 Almada',
    clientName: 'Familia Almada',
    clientPhone: '0981-206677',
    location: 'Salón Girasol, Fernando de la Mora',
    eventDate: new Date('2026-08-04T17:00:00'),
    guestsCount: 90,
    serviceHours: 5,
    status: EventStatus.EN_CURSO,
    totalAmount: 5800000,
    depositPaid: 3000000,
    recipeNames: ['Daiquiri', 'Cosmopolitan'],
    staffNames: ['Andrés Gómez'],
  },
  {
    title: 'Casamiento Vera - Jardín Botánico',
    clientName: 'Camila Vera',
    clientPhone: '0981-207788',
    location: 'Jardín Botánico, Asunción',
    eventDate: new Date('2026-08-10T18:00:00'),
    guestsCount: 130,
    serviceHours: 6,
    status: EventStatus.CONFIRMADO,
    totalAmount: 11000000,
    depositPaid: 5500000,
    recipeNames: ['Mojito', 'Margarita', 'Negroni'],
    staffNames: ['Diego Martínez', 'Lucía Fernández'],
  },
  {
    title: 'Evento corporativo Banco Continental',
    clientName: 'Banco Continental',
    clientPhone: '021-556000',
    location: 'Hotel Bourbon, Asunción',
    eventDate: new Date('2026-08-22T19:00:00'),
    guestsCount: 220,
    serviceHours: 4,
    status: EventStatus.CONFIRMADO,
    totalAmount: 16800000,
    depositPaid: 8400000,
    recipeNames: ['Aperol Spritz', 'Gin Tonic', 'Whiskey Sour'],
    staffNames: ['Diego Martínez', 'Valentina Ríos', 'Andrés Gómez'],
  },
  {
    title: 'Casamiento Ortiz - Salón Real',
    clientName: 'Julia Ortiz',
    clientPhone: '0981-208899',
    location: 'Salón Real, Lambaré',
    eventDate: new Date('2026-09-05T19:00:00'),
    guestsCount: 100,
    serviceHours: 6,
    status: EventStatus.COTIZADO,
    totalAmount: 8200000,
    depositPaid: 0,
    recipeNames: ['Old Fashioned', 'Piña Colada'],
    staffNames: ['Lucía Fernández'],
  },
  {
    title: 'Cumpleaños 50 Franco',
    clientName: 'Hugo Franco',
    clientPhone: '0981-209900',
    location: 'Quinta Ykuá, Areguá',
    eventDate: new Date('2026-09-20T20:00:00'),
    guestsCount: 70,
    serviceHours: 5,
    status: EventStatus.COTIZADO,
    totalAmount: 5100000,
    depositPaid: 0,
    recipeNames: ['Cuba Libre', 'Daiquiri'],
    staffNames: ['Valentina Ríos'],
  },
];

const AUDIT_LOGS: Array<{
  action: string;
  entity: string;
  details: string;
  hoursAgo: number;
}> = [
  { action: 'LOGIN', entity: 'User', details: 'Inicio de sesión exitoso.', hoursAgo: 1 },
  {
    action: 'UPDATE_EVENT',
    entity: 'Event',
    details: 'Actualizó el estado a EN_CURSO: Cumpleaños 15 Almada.',
    hoursAgo: 3,
  },
  {
    action: 'CREATE_EVENT',
    entity: 'Event',
    details: 'Creó la cotización: Cumpleaños 50 Franco.',
    hoursAgo: 8,
  },
  {
    action: 'UPDATE_INGREDIENT',
    entity: 'Ingredient',
    details: 'Ajustó stock de Hielo tras el evento Fiesta egresados CNU.',
    hoursAgo: 20,
  },
  {
    action: 'CREATE_EVENT',
    entity: 'Event',
    details: 'Confirmó el evento: Evento corporativo Banco Continental.',
    hoursAgo: 30,
  },
  {
    action: 'UPDATE_RECIPE',
    entity: 'Recipe',
    details: 'Ajustó el precio sugerido de Aperol Spritz.',
    hoursAgo: 50,
  },
  {
    action: 'DELETE_EVENT',
    entity: 'Event',
    details: 'Canceló el evento corporativo Itaú (cliente desistió).',
    hoursAgo: 96,
  },
  {
    action: 'CREATE_INGREDIENT',
    entity: 'Ingredient',
    details: 'Agregó Prosecco al catálogo de insumos.',
    hoursAgo: 150,
  },
];

// ============================================================
// Ja'umina ERP genérico — datos de ejemplo de una distribuidora mayorista
// (rubro distinto a la coctelería, para mostrar la reutilización del núcleo).
// ============================================================

const PROVEEDORES: Array<{
  name: string;
  documento: string;
  phone: string;
  email: string;
  address: string;
}> = [
  {
    name: 'Distribuidora La Paraguaya S.A.',
    documento: '80012345-6',
    phone: '021-701122',
    email: 'ventas@laparaguaya.com.py',
    address: 'Av. Eusebio Ayala 2340, Asunción',
  },
  {
    name: 'Importadora Central',
    documento: '80023456-7',
    phone: '021-702233',
    email: 'contacto@importadoracentral.com.py',
    address: 'Ruta 2 Km 15, San Lorenzo',
  },
  {
    name: 'AlmacénMax Mayorista',
    documento: '80034567-8',
    phone: '021-703344',
    email: 'pedidos@almacenmax.com.py',
    address: 'Av. Defensores del Chaco 1150, Fernando de la Mora',
  },
];

const CLIENTES: Array<{
  name: string;
  documento?: string;
  phone: string;
  email?: string;
  address: string;
}> = [
  {
    name: 'Despensa Doña Rosa',
    phone: '0981-301122',
    address: 'Barrio Obrero, Asunción',
  },
  {
    name: 'Kiosco Central',
    phone: '0981-302233',
    address: 'Villa Morra, Asunción',
  },
  {
    name: 'Supermercado Family',
    documento: '80099887-2',
    phone: '021-704455',
    email: 'compras@family.com.py',
    address: 'Av. Mcal. López 3200, Asunción',
  },
  {
    name: 'Almacén Don Pedro',
    phone: '0981-304455',
    address: 'Luque, Central',
  },
  {
    name: 'Minimarket 24hs',
    documento: '80088776-3',
    phone: '021-705566',
    address: 'San Lorenzo, Central',
  },
];

const PRODUCTOS: Array<{
  name: string;
  code: string;
  category: string;
  unit: Unit;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
}> = [
  { name: 'Coca-Cola 2L', code: 'BEB-001', category: 'Bebidas', unit: Unit.UNIDADES, costPrice: 7500, salePrice: 10500, stock: 120, minStock: 30 },
  { name: 'Cerveza Brahma Lata 473ml', code: 'BEB-002', category: 'Bebidas', unit: Unit.UNIDADES, costPrice: 4200, salePrice: 6000, stock: 8, minStock: 48 },
  { name: 'Agua Mineral 2L', code: 'BEB-003', category: 'Bebidas', unit: Unit.UNIDADES, costPrice: 3500, salePrice: 5000, stock: 90, minStock: 24 },
  { name: 'Arroz 1kg', code: 'ALM-001', category: 'Almacén', unit: Unit.UNIDADES, costPrice: 4800, salePrice: 6500, stock: 200, minStock: 40 },
  { name: 'Fideos 500g', code: 'ALM-002', category: 'Almacén', unit: Unit.UNIDADES, costPrice: 3200, salePrice: 4500, stock: 150, minStock: 40 },
  { name: 'Aceite de Girasol 900ml', code: 'ALM-003', category: 'Almacén', unit: Unit.UNIDADES, costPrice: 8500, salePrice: 11500, stock: 15, minStock: 20 },
  { name: 'Azúcar 1kg', code: 'ALM-004', category: 'Almacén', unit: Unit.UNIDADES, costPrice: 4200, salePrice: 5800, stock: 100, minStock: 30 },
  { name: 'Yerba Mate 500g', code: 'ALM-005', category: 'Almacén', unit: Unit.UNIDADES, costPrice: 9500, salePrice: 13000, stock: 60, minStock: 20 },
  { name: 'Papel Higiénico x4', code: 'LIM-001', category: 'Limpieza', unit: Unit.UNIDADES, costPrice: 6800, salePrice: 9500, stock: 80, minStock: 25 },
  { name: 'Detergente 750ml', code: 'LIM-002', category: 'Limpieza', unit: Unit.UNIDADES, costPrice: 5200, salePrice: 7200, stock: 45, minStock: 20 },
];

const EMPLEADOS: Array<{
  name: string;
  position: string;
  phone: string;
  salary: number;
  hireDate: Date;
}> = [
  { name: 'Roberto Cáceres', position: 'Encargado de Depósito', phone: '0981-401122', salary: 3800000, hireDate: new Date('2024-03-01') },
  { name: 'Silvia Ramírez', position: 'Cajera', phone: '0981-402233', salary: 3200000, hireDate: new Date('2025-01-15') },
  { name: 'Fernando Ayala', position: 'Repartidor', phone: '0981-403344', salary: 3400000, hireDate: new Date('2024-08-20') },
];

async function main() {
  console.log('Seeding database...');

  await prisma.eventDrink.deleteMany();
  await prisma.eventStaff.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.event.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.staff.deleteMany();

  await prisma.empleadoMovimiento.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.ventaItem.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.compraItem.deleteMany();
  await prisma.compra.deleteMany();
  await prisma.cajaSesion.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.cliente.deleteMany();

  const ingredientByName = new Map<string, { id: string; costPerUnit: number }>();
  for (const ingredient of INGREDIENTS) {
    const created = await prisma.ingredient.create({ data: ingredient });
    ingredientByName.set(ingredient.name, {
      id: created.id,
      costPerUnit: ingredient.costPerUnit,
    });
  }
  console.log(`  ${INGREDIENTS.length} insumos creados.`);

  const recipeByName = new Map<string, string>();
  for (const recipe of RECIPES) {
    const { ingredients, ...recipeData } = recipe;

    const cost = ingredients.reduce((sum, { name, quantity }) => {
      const ingredient = ingredientByName.get(name);
      if (!ingredient) {
        throw new Error(`Insumo no encontrado en seed: ${name}`);
      }
      return sum + quantity * ingredient.costPerUnit;
    }, 0);
    const price =
      Math.round((cost * SUGGESTED_PRICE_MARKUP) / PRICE_ROUNDING) * PRICE_ROUNDING;

    const created = await prisma.recipe.create({
      data: {
        ...recipeData,
        price,
        ingredients: {
          create: ingredients.map(({ name, quantity }) => ({
            ingredientId: ingredientByName.get(name)!.id,
            quantity,
          })),
        },
      },
    });
    recipeByName.set(recipe.name, created.id);
  }
  console.log(`  ${RECIPES.length} recetas creadas (precio sugerido = costo escandallo × ${SUGGESTED_PRICE_MARKUP}).`);

  const staffByName = new Map<string, string>();
  for (const staff of STAFF) {
    const created = await prisma.staff.create({ data: staff });
    staffByName.set(staff.name, created.id);
  }
  console.log(`  ${STAFF.length} miembros de staff creados.`);

  // Fuera de entornos locales (NODE_ENV=production, como en Render) no se permite
  // sembrar el Admin con la contraseña por defecto — hay que pasar una propia vía
  // ADMIN_SEED_PASSWORD. Ver backend/DATABASE_RULES.md.
  const isProduction = process.env.NODE_ENV === 'production';
  const adminPasswordPlain = process.env.ADMIN_SEED_PASSWORD;
  if (isProduction && !adminPasswordPlain) {
    throw new Error(
      'ADMIN_SEED_PASSWORD es obligatoria en producción (NODE_ENV=production) — ' +
        'no se permite sembrar el usuario Admin con la contraseña por defecto fuera de un entorno local.',
    );
  }
  if (!adminPasswordPlain) {
    console.warn(
      '  ⚠ ADMIN_SEED_PASSWORD no definida — usando la contraseña por defecto de dev (Admin123!). No usar en producción.',
    );
  }
  const adminPassword = await bcrypt.hash(adminPasswordPlain ?? 'Admin123!', SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cocteleriapremium.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@cocteleriapremium.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log(
    `  Usuario Admin creado/actualizado (admin@cocteleriapremium.com / ${adminPasswordPlain ? '<definida por ADMIN_SEED_PASSWORD>' : 'Admin123!'}).`,
  );

  for (const event of EVENTS) {
    const { recipeNames, staffNames, ...eventData } = event;
    await prisma.event.create({
      data: {
        ...eventData,
        drinks: {
          create: recipeNames.map((name) => ({
            recipeId:
              recipeByName.get(name) ??
              (() => {
                throw new Error(`Receta no encontrada en seed de eventos: ${name}`);
              })(),
          })),
        },
        staff: {
          create: staffNames.map((name) => ({
            staffId:
              staffByName.get(name) ??
              (() => {
                throw new Error(`Staff no encontrado en seed de eventos: ${name}`);
              })(),
          })),
        },
      },
    });
  }
  console.log(`  ${EVENTS.length} eventos creados.`);

  const now = Date.now();
  for (const log of AUDIT_LOGS) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: log.action,
        entity: log.entity,
        details: log.details,
        createdAt: new Date(now - log.hoursAgo * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  ${AUDIT_LOGS.length} registros de auditoría creados.`);

  const proveedorByName = new Map<string, string>();
  for (const proveedor of PROVEEDORES) {
    const created = await prisma.proveedor.create({ data: proveedor });
    proveedorByName.set(proveedor.name, created.id);
  }
  console.log(`  ${PROVEEDORES.length} proveedores creados.`);

  const clienteByName = new Map<string, string>();
  for (const cliente of CLIENTES) {
    const created = await prisma.cliente.create({ data: cliente });
    clienteByName.set(cliente.name, created.id);
  }
  console.log(`  ${CLIENTES.length} clientes creados.`);

  const productoByName = new Map<string, { id: string; costPrice: number; salePrice: number }>();
  for (const producto of PRODUCTOS) {
    const created = await prisma.producto.create({ data: producto });
    productoByName.set(producto.name, {
      id: created.id,
      costPrice: producto.costPrice,
      salePrice: producto.salePrice,
    });
    if (producto.stock > 0) {
      await prisma.movimientoInventario.create({
        data: {
          productoId: created.id,
          tipo: 'ENTRADA',
          origen: 'MANUAL',
          quantity: producto.stock,
          reason: 'Alta inicial de producto',
        },
      });
    }
  }
  console.log(`  ${PRODUCTOS.length} productos creados.`);

  const empleadoByName = new Map<string, string>();
  for (const empleado of EMPLEADOS) {
    const created = await prisma.empleado.create({ data: empleado });
    empleadoByName.set(empleado.name, created.id);
  }
  await prisma.empleadoMovimiento.create({
    data: {
      empleadoId: empleadoByName.get('Fernando Ayala')!,
      tipo: 'ADELANTO',
      amount: 500000,
      date: new Date('2026-07-28'),
      notes: 'Adelanto de sueldo por gastos de combustible.',
    },
  });
  await prisma.empleadoMovimiento.create({
    data: {
      empleadoId: empleadoByName.get('Silvia Ramírez')!,
      tipo: 'PRESTAMO',
      amount: 1200000,
      date: new Date('2026-06-10'),
      notes: 'Préstamo personal a descontar en 4 cuotas.',
    },
  });
  console.log(`  ${EMPLEADOS.length} empleados creados (con 2 movimientos).`);

  // --- Compras (con automatización: entrada de stock + gasto asociado) ---
  const COMPRAS: Array<{
    proveedor: string;
    invoiceNumber: string;
    purchaseDate: Date;
    items: Array<{ producto: string; quantity: number }>;
  }> = [
    {
      proveedor: 'Distribuidora La Paraguaya S.A.',
      invoiceNumber: 'A-001-0001234',
      purchaseDate: new Date('2026-07-10'),
      items: [
        { producto: 'Coca-Cola 2L', quantity: 60 },
        { producto: 'Agua Mineral 2L', quantity: 50 },
      ],
    },
    {
      proveedor: 'Importadora Central',
      invoiceNumber: 'B-002-0005678',
      purchaseDate: new Date('2026-07-22'),
      items: [
        { producto: 'Aceite de Girasol 900ml', quantity: 30 },
        { producto: 'Yerba Mate 500g', quantity: 40 },
      ],
    },
    {
      proveedor: 'AlmacénMax Mayorista',
      invoiceNumber: 'A-003-0009012',
      purchaseDate: new Date('2026-08-01'),
      items: [
        { producto: 'Arroz 1kg', quantity: 100 },
        { producto: 'Fideos 500g', quantity: 80 },
        { producto: 'Detergente 750ml', quantity: 25 },
      ],
    },
  ];

  for (const compraData of COMPRAS) {
    const proveedorId = proveedorByName.get(compraData.proveedor)!;
    const items = compraData.items.map(({ producto, quantity }) => {
      const info = productoByName.get(producto)!;
      return { productoId: info.id, quantity, unitCost: info.costPrice, subtotal: quantity * info.costPrice };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const compra = await prisma.compra.create({
      data: {
        proveedorId,
        invoiceNumber: compraData.invoiceNumber,
        purchaseDate: compraData.purchaseDate,
        totalAmount,
        items: { create: items },
      },
    });

    await prisma.gasto.create({
      data: {
        description: `Compra a ${compraData.proveedor} (Fact. ${compraData.invoiceNumber})`,
        category: 'Compra de mercadería',
        amount: totalAmount,
        origin: 'COMPRA',
        compraId: compra.id,
        expenseDate: compraData.purchaseDate,
      },
    });

    for (const item of items) {
      await prisma.movimientoInventario.create({
        data: {
          productoId: item.productoId,
          tipo: 'ENTRADA',
          origen: 'COMPRA',
          quantity: item.quantity,
          reason: `Compra a ${compraData.proveedor}`,
          referenceId: compra.id,
          createdAt: compraData.purchaseDate,
        },
      });
    }
  }
  console.log(`  ${COMPRAS.length} compras creadas (con gasto e ingreso de stock automáticos).`);

  // --- Ventas (con automatización: salida de stock) ---
  const VENTAS: Array<{
    cliente: string | null;
    saleDate: Date;
    status: 'PAGADA' | 'PENDIENTE';
    items: Array<{ producto: string; quantity: number }>;
  }> = [
    {
      cliente: 'Despensa Doña Rosa',
      saleDate: new Date('2026-07-15'),
      status: 'PAGADA',
      items: [
        { producto: 'Coca-Cola 2L', quantity: 12 },
        { producto: 'Arroz 1kg', quantity: 10 },
      ],
    },
    {
      cliente: 'Kiosco Central',
      saleDate: new Date('2026-07-20'),
      status: 'PAGADA',
      items: [{ producto: 'Cerveza Brahma Lata 473ml', quantity: 24 }],
    },
    {
      cliente: 'Supermercado Family',
      saleDate: new Date('2026-07-29'),
      status: 'PENDIENTE',
      items: [
        { producto: 'Yerba Mate 500g', quantity: 20 },
        { producto: 'Azúcar 1kg', quantity: 30 },
        { producto: 'Papel Higiénico x4', quantity: 15 },
      ],
    },
    {
      cliente: 'Almacén Don Pedro',
      saleDate: new Date('2026-08-02'),
      status: 'PAGADA',
      items: [
        { producto: 'Fideos 500g', quantity: 25 },
        { producto: 'Aceite de Girasol 900ml', quantity: 10 },
      ],
    },
    {
      cliente: 'Minimarket 24hs',
      saleDate: new Date('2026-08-03'),
      status: 'PAGADA',
      items: [{ producto: 'Detergente 750ml', quantity: 12 }],
    },
    {
      cliente: null,
      saleDate: new Date('2026-08-04'),
      status: 'PAGADA',
      items: [{ producto: 'Agua Mineral 2L', quantity: 6 }],
    },
  ];

  for (const ventaData of VENTAS) {
    const items = ventaData.items.map(({ producto, quantity }) => {
      const info = productoByName.get(producto)!;
      return {
        productoId: info.id,
        quantity,
        unitPrice: info.salePrice,
        subtotal: quantity * info.salePrice,
      };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const paidAmount = ventaData.status === 'PAGADA' ? totalAmount : 0;

    const venta = await prisma.venta.create({
      data: {
        clienteId: ventaData.cliente ? clienteByName.get(ventaData.cliente) : undefined,
        saleDate: ventaData.saleDate,
        status: ventaData.status,
        totalAmount,
        paidAmount,
        items: { create: items },
      },
    });

    for (const item of items) {
      await prisma.movimientoInventario.create({
        data: {
          productoId: item.productoId,
          tipo: 'SALIDA',
          origen: 'VENTA',
          quantity: item.quantity,
          reason: 'Venta',
          referenceId: venta.id,
          createdAt: ventaData.saleDate,
        },
      });
    }
  }
  console.log(`  ${VENTAS.length} ventas creadas (con salida de stock automática).`);

  // --- Gastos manuales (no ligados a una compra) ---
  await prisma.gasto.create({
    data: {
      description: 'Alquiler del depósito',
      category: 'Alquiler',
      amount: 2800000,
      origin: 'MANUAL',
      expenseDate: new Date('2026-07-05'),
    },
  });
  await prisma.gasto.create({
    data: {
      description: 'Factura de electricidad',
      category: 'Servicios',
      amount: 650000,
      origin: 'MANUAL',
      expenseDate: new Date('2026-07-28'),
    },
  });
  console.log('  2 gastos manuales creados.');

  // --- Caja: una sesión cerrada (histórica) y una abierta (actual) ---
  await prisma.cajaSesion.create({
    data: {
      openedAt: new Date('2026-08-03T08:00:00'),
      closedAt: new Date('2026-08-03T20:00:00'),
      openingAmount: 500000,
      closingAmount: 1450000,
      expectedAmount: 1430000,
      status: 'CERRADA',
      notes: 'Cierre con diferencia menor a favor.',
      openedById: admin.id,
      closedById: admin.id,
    },
  });
  await prisma.cajaSesion.create({
    data: {
      openedAt: new Date('2026-08-04T08:00:00'),
      openingAmount: 500000,
      status: 'ABIERTA',
      openedById: admin.id,
    },
  });
  console.log('  2 sesiones de caja creadas (1 cerrada, 1 abierta).');

  console.log('Seed completo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
