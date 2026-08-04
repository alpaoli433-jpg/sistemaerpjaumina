import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateStaffDto, userId: string) {
    const staff = await this.prisma.staff.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CREATE_STAFF',
      entity: 'Staff',
      details: `Dio de alta al personal de eventos: ${staff.name}.`,
    });
    return staff;
  }

  findAll() {
    return this.prisma.staff.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Personal no encontrado');
    }
    return staff;
  }

  async update(id: string, dto: UpdateStaffDto, userId: string) {
    await this.findOne(id);
    const staff = await this.prisma.staff.update({ where: { id }, data: dto });
    await this.audit.log({
      userId,
      action: 'UPDATE_STAFF',
      entity: 'Staff',
      details: `Actualizó al personal de eventos: ${staff.name}.`,
    });
    return staff;
  }

  async remove(id: string, userId: string) {
    const staff = await this.findOne(id);
    try {
      await this.prisma.staff.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar: este personal está asignado a uno o más eventos.',
        );
      }
      throw error;
    }
    await this.audit.log({
      userId,
      action: 'DELETE_STAFF',
      entity: 'Staff',
      details: `Eliminó al personal de eventos: ${staff.name}.`,
    });
    return { id };
  }
}
