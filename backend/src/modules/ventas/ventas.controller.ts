import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR, Role.BARTENDER)
  @Post()
  create(@Body() dto: CreateVentaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ventasService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Patch(':id/anular')
  anular(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ventasService.anular(id, user.id);
  }
}
