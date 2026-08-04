import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntry {
  userId: string;
  action: string;
  entity: string;
  details?: string;
}

// Servicio único de auditoría (JAUMINA_WORKSPACE_RULES.md §8 y §9): cualquier
// módulo que mute datos debe registrar la acción acá en vez de escribir en
// AuditLog directamente, para no duplicar esa lógica en cada servicio.
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(entry: AuditEntry) {
    return this.prisma.auditLog.create({ data: entry });
  }
}
