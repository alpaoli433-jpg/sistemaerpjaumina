import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { PaginationQueryDto } from '../../shared/pagination/pagination-query.dto';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

@Injectable()
export class GastosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateGastoDto, userId: string) {
    const gasto = await this.prisma.gasto.create({
      data: {
        description: dto.description,
        category: dto.category,
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        origin: 'MANUAL',
      },
    });
    await this.audit.log({
      userId,
      action: 'CREATE_GASTO',
      entity: 'Gasto',
      details: `Registró el gasto: ${gasto.description} (₲ ${gasto.amount}).`,
    });
    return gasto;
  }

  async findAll(query: PaginationQueryDto = {}) {
    const where = { deletedAt: null };
    const include = { compra: { include: { proveedor: true } } };
    if (query.take === undefined) {
      return this.prisma.gasto.findMany({
        where,
        include,
        orderBy: { expenseDate: 'desc' },
      });
    }
    const take = query.take;
    const skip = query.skip ?? 0;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.gasto.findMany({
        where,
        include,
        orderBy: { expenseDate: 'desc' },
        take,
        skip,
      }),
      this.prisma.gasto.count({ where }),
    ]);
    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const gasto = await this.prisma.gasto.findFirst({
      where: { id, deletedAt: null },
      include: { compra: { include: { proveedor: true } } },
    });
    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }
    return gasto;
  }

  async update(id: string, dto: UpdateGastoDto, userId: string) {
    const gasto = await this.findOne(id);
    if (gasto.origin !== 'MANUAL') {
      throw new BadRequestException(
        'No se puede editar un gasto generado automáticamente por una compra.',
      );
    }
    const updated = await this.prisma.gasto.update({
      where: { id },
      data: {
        ...dto,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      },
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_GASTO',
      entity: 'Gasto',
      details: `Actualizó el gasto: ${updated.description}.`,
    });
    return updated;
  }

  async remove(id: string, userId: string) {
    const gasto = await this.findOne(id);
    if (gasto.origin !== 'MANUAL') {
      throw new BadRequestException(
        'No se puede eliminar un gasto generado automáticamente por una compra.',
      );
    }
    await this.prisma.gasto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_GASTO',
      entity: 'Gasto',
      details: `Eliminó el gasto: ${gasto.description}.`,
    });
    return { id };
  }
}
