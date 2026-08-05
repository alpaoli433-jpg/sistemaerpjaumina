import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { PaginationQueryDto } from '../../shared/pagination/pagination-query.dto';
import { CreateVentaDto } from './dto/create-venta.dto';

const VENTA_INCLUDE = {
  cliente: true,
  items: { include: { producto: true } },
} as const;

@Injectable()
export class VentasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Automatización (JAUMINA §8): Venta -> Inventario (salida de stock) ->
  // Ingresos (Dashboard) -> Cliente (historial) -> Auditoría.
  async create(dto: CreateVentaDto, userId: string) {
    const productos = await this.prisma.producto.findMany({
      where: {
        id: { in: dto.items.map((item) => item.productoId) },
        deletedAt: null,
      },
    });
    const productoById = new Map(
      productos.map((producto) => [producto.id, producto]),
    );

    if (dto.clienteId) {
      const cliente = await this.prisma.cliente.findFirst({
        where: { id: dto.clienteId, deletedAt: null },
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }

    const items = dto.items.map((item) => {
      const producto = productoById.get(item.productoId);
      if (!producto) {
        throw new NotFoundException(
          `Producto no encontrado: ${item.productoId}`,
        );
      }
      if (producto.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente de "${producto.name}": hay ${producto.stock} y se pidieron ${item.quantity}.`,
        );
      }
      const unitPrice = item.unitPrice ?? producto.salePrice;
      return {
        productoId: item.productoId,
        quantity: item.quantity,
        unitPrice,
        subtotal: Math.round(item.quantity * unitPrice),
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const status = dto.status ?? 'PAGADA';
    const paidAmount =
      dto.paidAmount ?? (status === 'PAGADA' ? totalAmount : 0);

    const venta = await this.prisma.$transaction(async (tx) => {
      const created = await tx.venta.create({
        data: {
          clienteId: dto.clienteId,
          status,
          totalAmount,
          paidAmount,
          notes: dto.notes,
          items: { create: items },
        },
      });

      for (const item of items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'SALIDA',
            origen: 'VENTA',
            quantity: item.quantity,
            reason: 'Venta',
            referenceId: created.id,
          },
        });
      }

      return created;
    });

    await this.audit.log({
      userId,
      action: 'CREATE_VENTA',
      entity: 'Venta',
      details: `Registró una venta por ₲ ${totalAmount}.`,
    });

    return this.findOne(venta.id);
  }

  async findAll(query: PaginationQueryDto = {}) {
    const where = { deletedAt: null };
    if (query.take === undefined) {
      return this.prisma.venta.findMany({
        where,
        include: VENTA_INCLUDE,
        orderBy: { saleDate: 'desc' },
      });
    }
    const take = query.take;
    const skip = query.skip ?? 0;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.venta.findMany({
        where,
        include: VENTA_INCLUDE,
        orderBy: { saleDate: 'desc' },
        take,
        skip,
      }),
      this.prisma.venta.count({ where }),
    ]);
    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const venta = await this.prisma.venta.findFirst({
      where: { id, deletedAt: null },
      include: VENTA_INCLUDE,
    });
    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }
    return venta;
  }

  // Anular repone el stock que la venta había descontado (con su propio
  // movimiento de inventario, para no perder el rastro en el historial).
  async anular(id: string, userId: string) {
    const venta = await this.findOne(id);
    if (venta.status === 'ANULADA') {
      throw new BadRequestException('Esta venta ya está anulada.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.venta.update({ where: { id }, data: { status: 'ANULADA' } });

      for (const item of venta.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'ENTRADA',
            origen: 'MANUAL',
            quantity: item.quantity,
            reason: 'Anulación de venta',
            referenceId: id,
          },
        });
      }
    });

    await this.audit.log({
      userId,
      action: 'ANULAR_VENTA',
      entity: 'Venta',
      details: `Anuló una venta por ₲ ${venta.totalAmount} (repuso el stock).`,
    });

    return this.findOne(id);
  }
}
