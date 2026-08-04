import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('sesiones')
  findAll() {
    return this.cajaService.findAll();
  }

  @Get('actual')
  getActual() {
    return this.cajaService.getActual();
  }

  @Roles(Role.ADMIN, Role.COORDINADOR, Role.BARTENDER)
  @Post('abrir')
  abrir(@Body() dto: AbrirCajaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cajaService.abrir(dto, user.id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR, Role.BARTENDER)
  @Post(':id/cerrar')
  cerrar(
    @Param('id') id: string,
    @Body() dto: CerrarCajaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cajaService.cerrar(id, dto, user.id);
  }
}
