import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';

@Injectable()
export class CajaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.cajaSesion.findMany({ orderBy: { openedAt: 'desc' } });
  }

  getActual() {
    return this.prisma.cajaSesion.findFirst({
      where: { status: 'ABIERTA' },
      orderBy: { openedAt: 'desc' },
    });
  }

  async abrir(dto: AbrirCajaDto, userId: string) {
    const abierta = await this.getActual();
    if (abierta) {
      throw new BadRequestException('Ya hay una sesión de caja abierta.');
    }

    const sesion = await this.prisma.cajaSesion.create({
      data: {
        openingAmount: dto.openingAmount,
        notes: dto.notes,
        openedById: userId,
      },
    });

    await this.audit.log({
      userId,
      action: 'ABRIR_CAJA',
      entity: 'CajaSesion',
      details: `Abrió caja con ₲ ${dto.openingAmount}.`,
    });

    return sesion;
  }

  async cerrar(id: string, dto: CerrarCajaDto, userId: string) {
    const sesion = await this.prisma.cajaSesion.findUnique({ where: { id } });
    if (!sesion) {
      throw new NotFoundException('Sesión de caja no encontrada');
    }
    if (sesion.status === 'CERRADA') {
      throw new BadRequestException('Esta sesión de caja ya está cerrada.');
    }

    const ventasDelPeriodo = await this.prisma.venta.aggregate({
      where: {
        deletedAt: null,
        status: { not: 'ANULADA' },
        saleDate: { gte: sesion.openedAt },
      },
      _sum: { paidAmount: true },
    });
    const expectedAmount =
      sesion.openingAmount + (ventasDelPeriodo._sum.paidAmount ?? 0);

    const closed = await this.prisma.cajaSesion.update({
      where: { id },
      data: {
        closingAmount: dto.closingAmount,
        expectedAmount,
        status: 'CERRADA',
        closedAt: new Date(),
        closedById: userId,
        notes: dto.notes ?? sesion.notes,
      },
    });

    const diferencia = dto.closingAmount - expectedAmount;
    await this.audit.log({
      userId,
      action: 'CERRAR_CAJA',
      entity: 'CajaSesion',
      details: `Cerró caja. Esperado ₲ ${expectedAmount}, contado ₲ ${dto.closingAmount} (diferencia ₲ ${diferencia}).`,
    });

    return closed;
  }
}
