import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ConfiguracionService } from './configuracion.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get()
  getEmpresa() {
    return this.configuracionService.getEmpresa();
  }

  @Roles(Role.ADMIN)
  @Patch()
  updateEmpresa(
    @Body() dto: UpdateEmpresaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.configuracionService.updateEmpresa(dto, user.id);
  }
}
