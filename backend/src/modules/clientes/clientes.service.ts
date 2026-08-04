import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateClienteDto, userId: string) {
    const cliente = await this.prisma.cliente.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CREATE_CLIENTE',
      entity: 'Cliente',
      details: `Creó el cliente: ${cliente.name}.`,
    });
    return cliente;
  }

  findAll() {
    return this.prisma.cliente.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      include: {
        ventas: {
          where: { deletedAt: null },
          orderBy: { saleDate: 'desc' },
          include: { items: { include: { producto: true } } },
        },
      },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto, userId: string) {
    await this.findOne(id);
    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_CLIENTE',
      entity: 'Cliente',
      details: `Actualizó el cliente: ${cliente.name}.`,
    });
    return cliente;
  }

  async remove(id: string, userId: string) {
    const cliente = await this.findOne(id);
    await this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: 'DELETE_CLIENTE',
      entity: 'Cliente',
      details: `Eliminó el cliente: ${cliente.name}.`,
    });
    return { id };
  }
}
