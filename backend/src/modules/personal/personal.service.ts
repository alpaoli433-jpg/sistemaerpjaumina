import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateMovimientoEmpleadoDto } from './dto/create-movimiento-empleado.dto';

@Injectable()
export class PersonalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateEmpleadoDto, userId: string) {
    const empleado = await this.prisma.empleado.create({
      data: {
        ...dto,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      },
    });
    await this.audit.log({
      userId,
      action: 'CREATE_EMPLEADO',
      entity: 'Empleado',
      details: `Dio de alta al empleado: ${empleado.name}.`,
    });
    return empleado;
  }

  findAll() {
    return this.prisma.empleado.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const empleado = await this.prisma.empleado.findFirst({
      where: { id, deletedAt: null },
      include: { movimientos: { orderBy: { date: 'desc' } } },
    });
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }
    return empleado;
  }

  async update(id: string, dto: UpdateEmpleadoDto, userId: string) {
    await this.findOne(id);
    const empleado = await this.prisma.empleado.update({
      where: { id },
      data: {
        ...dto,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      },
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_EMPLEADO',
      entity: 'Empleado',
      details: `Actualizó al empleado: ${empleado.name}.`,
    });
    return empleado;
  }

  async remove(id: string, userId: string) {
    const empleado = await this.findOne(id);
    await this.prisma.empleado.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_EMPLEADO',
      entity: 'Empleado',
      details: `Eliminó al empleado: ${empleado.name}.`,
    });
    return { id };
  }

  async addMovimiento(
    empleadoId: string,
    dto: CreateMovimientoEmpleadoDto,
    userId: string,
  ) {
    const empleado = await this.findOne(empleadoId);
    const movimiento = await this.prisma.empleadoMovimiento.create({
      data: {
        empleadoId,
        tipo: dto.tipo,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
      },
    });
    await this.audit.log({
      userId,
      action: 'CREATE_MOVIMIENTO_EMPLEADO',
      entity: 'Empleado',
      details: `Registró un ${dto.tipo.toLowerCase()} de ₲ ${dto.amount} para ${empleado.name}.`,
    });
    return movimiento;
  }
}
