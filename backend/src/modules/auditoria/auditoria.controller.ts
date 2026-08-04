import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditoriaService } from './auditoria.service';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Get()
  findAll(@Query() query: QueryAuditoriaDto) {
    return this.auditoriaService.findAll(query);
  }
}
