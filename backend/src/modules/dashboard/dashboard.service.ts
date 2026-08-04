import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ACTIVE_EVENT_INCLUDE = {
  drinks: {
    include: {
      recipe: { include: { ingredients: { include: { ingredient: true } } } },
    },
  },
  staff: { include: { staff: true } },
} as const;

const ACTIVIDAD_RECIENTE_LIMIT = 10;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Los KPIs combinan las dos verticales que conviven hoy en el sistema:
  // Event (coctelería/eventos) y Venta+Gasto (ERP genérico Ja'umina). Ver
  // PENDIENTES.md sección "KPIs financieros" para el plan de unificación.
  async getSummary() {
    const monthly = new Map<string, { ingresos: number; gastos: number }>();
    let ingresos = 0;
    let cobrado = 0;
    let gastos = 0;

    const events = await this.prisma.event.findMany({
      where: { status: { not: 'CANCELADO' } },
      include: ACTIVE_EVENT_INCLUDE,
    });

    for (const event of events) {
      const insumosCost = event.drinks.reduce((sum, drink) => {
        const recipeCost = drink.recipe.ingredients.reduce(
          (recipeSum, item) =>
            recipeSum + item.quantity * item.ingredient.costPerUnit,
          0,
        );
        return sum + recipeCost;
      }, 0);
      const staffCost = event.staff.reduce(
        (sum, assignment) => sum + assignment.staff.dailyRate,
        0,
      );
      const eventGastos = insumosCost + staffCost;

      ingresos += event.totalAmount;
      cobrado += event.depositPaid;
      gastos += eventGastos;

      const key = monthKey(event.eventDate);
      const bucket = monthly.get(key) ?? { ingresos: 0, gastos: 0 };
      bucket.ingresos += event.totalAmount;
      bucket.gastos += eventGastos;
      monthly.set(key, bucket);
    }

    const ventas = await this.prisma.venta.findMany({
      where: { deletedAt: null, status: { not: 'ANULADA' } },
    });
    for (const venta of ventas) {
      ingresos += venta.totalAmount;
      cobrado += venta.paidAmount;

      const key = monthKey(venta.saleDate);
      const bucket = monthly.get(key) ?? { ingresos: 0, gastos: 0 };
      bucket.ingresos += venta.totalAmount;
      monthly.set(key, bucket);
    }

    const gastosGenericos = await this.prisma.gasto.findMany({
      where: { deletedAt: null },
    });
    for (const gasto of gastosGenericos) {
      gastos += gasto.amount;

      const key = monthKey(gasto.expenseDate);
      const bucket = monthly.get(key) ?? { ingresos: 0, gastos: 0 };
      bucket.gastos += gasto.amount;
      monthly.set(key, bucket);
    }

    const chart = Array.from(monthly.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({ month, ...values }));

    const eventosActivos = events.filter((event) =>
      ['CONFIRMADO', 'EN_CURSO'].includes(event.status),
    ).length;

    return {
      kpis: {
        ingresos,
        gastos,
        margen: ingresos - gastos,
        cobrado,
        eventosActivos,
      },
      chart,
      stockCritico: await this.getStockCritico(),
      actividadReciente: await this.getActividadReciente(),
    };
  }

  async getStockCritico() {
    const [ingredients, productos] = await Promise.all([
      this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.producto.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
    ]);

    const criticos = [
      ...ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        stock: i.stock,
        minStock: i.minStock,
        source: 'ingredient' as const,
      })),
      ...productos.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        stock: p.stock,
        minStock: p.minStock,
        source: 'producto' as const,
      })),
    ].filter((item) => item.stock <= item.minStock);

    return criticos.sort(
      (a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1),
    );
  }

  getActividadReciente() {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: ACTIVIDAD_RECIENTE_LIMIT,
    });
  }
}
