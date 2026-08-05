import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateServicioDto, userId: string) {
    const servicio = await this.prisma.servicio.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CREATE_SERVICIO',
      entity: 'Servicio',
      details: `Creó el servicio: ${servicio.name}.`,
    });
    return servicio;
  }

  findAll() {
    return this.prisma.servicio.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const servicio = await this.prisma.servicio.findFirst({
      where: { id, deletedAt: null },
    });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return servicio;
  }

  async update(id: string, dto: UpdateServicioDto, userId: string) {
    await this.findOne(id);
    const servicio = await this.prisma.servicio.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_SERVICIO',
      entity: 'Servicio',
      details: `Actualizó el servicio: ${servicio.name}.`,
    });
    return servicio;
  }

  async remove(id: string, userId: string) {
    const servicio = await this.findOne(id);
    await this.prisma.servicio.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_SERVICIO',
      entity: 'Servicio',
      details: `Eliminó el servicio: ${servicio.name}.`,
    });
    return { id };
  }
}
