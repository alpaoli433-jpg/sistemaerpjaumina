import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto';

const DEFAULT_TAKE = 25;

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryAuditoriaDto) {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.entity && { entity: query.entity }),
      ...(query.action && { action: query.action }),
      ...(query.userId && { userId: query.userId }),
    };

    const take = query.take ?? DEFAULT_TAKE;
    const skip = query.skip ?? 0;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, take, skip };
  }
}
