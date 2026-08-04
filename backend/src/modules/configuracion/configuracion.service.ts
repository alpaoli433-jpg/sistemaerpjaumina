import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class ConfiguracionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Empresa es un singleton: se crea con valores por defecto en el primer
  // acceso si todavía no existe ninguna fila.
  async getEmpresa() {
    const empresa = await this.prisma.empresa.findFirst();
    if (empresa) {
      return empresa;
    }
    return this.prisma.empresa.create({ data: {} });
  }

  async updateEmpresa(dto: UpdateEmpresaDto, userId: string) {
    const empresa = await this.getEmpresa();
    const updated = await this.prisma.empresa.update({
      where: { id: empresa.id },
      data: dto,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_CONFIGURACION',
      entity: 'Empresa',
      details: 'Actualizó los datos de la empresa / preferencias del sistema.',
    });
    return updated;
  }
}
