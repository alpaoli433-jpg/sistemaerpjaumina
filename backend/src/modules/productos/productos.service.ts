import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateProductoDto, userId: string) {
    const producto = await this.prisma.producto.create({ data: dto });

    if (producto.stock > 0) {
      await this.prisma.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: 'ENTRADA',
          origen: 'MANUAL',
          quantity: producto.stock,
          reason: 'Alta inicial de producto',
        },
      });
    }

    await this.audit.log({
      userId,
      action: 'CREATE_PRODUCTO',
      entity: 'Producto',
      details: `Creó el producto: ${producto.name}.`,
    });
    return producto;
  }

  findAll() {
    return this.prisma.producto.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, deletedAt: null },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  // Nota: el stock NO se edita acá — se mueve únicamente vía Compras, Ventas
  // o el ajuste manual del módulo Inventario, para mantener un único punto
  // de verdad con historial (MovimientoInventario).
  async update(id: string, dto: UpdateProductoDto, userId: string) {
    await this.findOne(id);
    const rest = { ...dto };
    delete rest.stock;
    const producto = await this.prisma.producto.update({
      where: { id },
      data: rest,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_PRODUCTO',
      entity: 'Producto',
      details: `Actualizó el producto: ${producto.name}.`,
    });
    return producto;
  }

  async remove(id: string, userId: string) {
    const producto = await this.findOne(id);
    await this.prisma.producto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_PRODUCTO',
      entity: 'Producto',
      details: `Eliminó el producto: ${producto.name}.`,
    });
    return { id };
  }
}
