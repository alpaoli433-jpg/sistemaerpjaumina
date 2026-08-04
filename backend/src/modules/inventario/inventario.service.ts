import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

const MOVIMIENTOS_LIMIT = 50;

@Injectable()
export class InventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  getMovimientos() {
    return this.prisma.movimientoInventario.findMany({
      include: { producto: true },
      orderBy: { createdAt: 'desc' },
      take: MOVIMIENTOS_LIMIT,
    });
  }

  async getStockCritico() {
    const productos = await this.prisma.producto.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return productos
      .filter((producto) => producto.stock <= producto.minStock)
      .sort(
        (a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1),
      );
  }

  async registrarMovimiento(dto: CreateMovimientoDto, userId: string) {
    const producto = await this.prisma.producto.findFirst({
      where: { id: dto.productoId, deletedAt: null },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    let delta: number;
    if (dto.tipo === 'ENTRADA') {
      delta = dto.quantity;
    } else if (dto.tipo === 'SALIDA') {
      if (producto.stock < dto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente: hay ${producto.stock} y se pidieron ${dto.quantity}.`,
        );
      }
      delta = -dto.quantity;
    } else {
      // AJUSTE: `quantity` es el nuevo stock absoluto que se quiere fijar.
      delta = dto.quantity - producto.stock;
    }

    const movementQuantity =
      dto.tipo === 'AJUSTE' ? Math.abs(delta) : dto.quantity;

    const [updatedProducto, movimiento] = await this.prisma.$transaction([
      this.prisma.producto.update({
        where: { id: producto.id },
        data: { stock: producto.stock + delta },
      }),
      this.prisma.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: dto.tipo,
          origen: 'MANUAL',
          quantity: movementQuantity,
          reason: dto.reason,
        },
        include: { producto: true },
      }),
    ]);

    await this.audit.log({
      userId,
      action: 'AJUSTE_INVENTARIO',
      entity: 'Producto',
      details: `${dto.tipo} de ${movementQuantity} en ${producto.name}${dto.reason ? ` (${dto.reason})` : ''}.`,
    });

    return { producto: updatedProducto, movimiento };
  }
}
