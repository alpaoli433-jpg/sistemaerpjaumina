import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { PaginationQueryDto } from '../../shared/pagination/pagination-query.dto';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateProveedorDto, userId: string) {
    const proveedor = await this.prisma.proveedor.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CREATE_PROVEEDOR',
      entity: 'Proveedor',
      details: `Creó el proveedor: ${proveedor.name}.`,
    });
    return proveedor;
  }

  async findAll(query: PaginationQueryDto = {}) {
    const where = { deletedAt: null };
    if (query.take === undefined) {
      return this.prisma.proveedor.findMany({ where, orderBy: { name: 'asc' } });
    }
    const take = query.take;
    const skip = query.skip ?? 0;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.proveedor.findMany({ where, orderBy: { name: 'asc' }, take, skip }),
      this.prisma.proveedor.count({ where }),
    ]);
    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
      include: {
        compras: {
          where: { deletedAt: null },
          orderBy: { purchaseDate: 'desc' },
          include: { items: { include: { producto: true } } },
        },
      },
    });
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return proveedor;
  }

  async update(id: string, dto: UpdateProveedorDto, userId: string) {
    await this.findOne(id);
    const proveedor = await this.prisma.proveedor.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_PROVEEDOR',
      entity: 'Proveedor',
      details: `Actualizó el proveedor: ${proveedor.name}.`,
    });
    return proveedor;
  }

  async remove(id: string, userId: string) {
    const proveedor = await this.findOne(id);
    await this.prisma.proveedor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_PROVEEDOR',
      entity: 'Proveedor',
      details: `Eliminó el proveedor: ${proveedor.name}.`,
    });
    return { id };
  }
}
