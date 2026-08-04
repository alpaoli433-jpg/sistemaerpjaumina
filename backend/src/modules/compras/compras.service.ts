import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateCompraDto } from './dto/create-compra.dto';

const COMPRA_INCLUDE = {
  proveedor: true,
  items: { include: { producto: true } },
  gasto: true,
} as const;

@Injectable()
export class ComprasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Automatización (JAUMINA §8): Compra -> Inventario (entrada de stock) ->
  // Gastos (gasto automático) -> Auditoría. El Dashboard recalcula ingresos/
  // gastos on-the-fly, así que no necesita un paso extra acá.
  async create(dto: CreateCompraDto, userId: string) {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: dto.proveedorId, deletedAt: null },
    });
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const items = dto.items.map((item) => ({
      ...item,
      subtotal: Math.round(item.quantity * item.unitCost),
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const compra = await this.prisma.$transaction(async (tx) => {
      const created = await tx.compra.create({
        data: {
          proveedorId: dto.proveedorId,
          invoiceNumber: dto.invoiceNumber,
          purchaseDate: dto.purchaseDate
            ? new Date(dto.purchaseDate)
            : undefined,
          notes: dto.notes,
          totalAmount,
          items: { create: items },
        },
      });

      for (const item of items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'ENTRADA',
            origen: 'COMPRA',
            quantity: item.quantity,
            reason: `Compra a ${proveedor.name}`,
            referenceId: created.id,
          },
        });
      }

      await tx.gasto.create({
        data: {
          description: `Compra a ${proveedor.name}${dto.invoiceNumber ? ` (Fact. ${dto.invoiceNumber})` : ''}`,
          category: 'Compra de mercadería',
          amount: totalAmount,
          origin: 'COMPRA',
          compraId: created.id,
        },
      });

      return created;
    });

    await this.audit.log({
      userId,
      action: 'CREATE_COMPRA',
      entity: 'Compra',
      details: `Registró una compra a ${proveedor.name} por ₲ ${totalAmount}.`,
    });

    return this.findOne(compra.id);
  }

  findAll() {
    return this.prisma.compra.findMany({
      where: { deletedAt: null },
      include: COMPRA_INCLUDE,
      orderBy: { purchaseDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const compra = await this.prisma.compra.findFirst({
      where: { id, deletedAt: null },
      include: COMPRA_INCLUDE,
    });
    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }
    return compra;
  }

  // Anular revierte el stock que la compra había ingresado y da de baja
  // (soft-delete) el gasto automático asociado, para que deje de contar en
  // los reportes.
  async anular(id: string, userId: string) {
    const compra = await this.findOne(id);
    if (compra.status === 'ANULADA') {
      throw new BadRequestException('Esta compra ya está anulada.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.compra.update({ where: { id }, data: { status: 'ANULADA' } });

      for (const item of compra.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'SALIDA',
            origen: 'MANUAL',
            quantity: item.quantity,
            reason: 'Anulación de compra',
            referenceId: id,
          },
        });
      }

      if (compra.gasto) {
        await tx.gasto.update({
          where: { id: compra.gasto.id },
          data: { deletedAt: new Date() },
        });
      }
    });

    await this.audit.log({
      userId,
      action: 'ANULAR_COMPRA',
      entity: 'Compra',
      details: `Anuló una compra a ${compra.proveedor.name} por ₲ ${compra.totalAmount} (revirtió stock y gasto).`,
    });

    return this.findOne(id);
  }
}
