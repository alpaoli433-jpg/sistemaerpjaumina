import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { InventarioService } from './inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('movimientos')
  getMovimientos() {
    return this.inventarioService.getMovimientos();
  }

  @Get('stock-critico')
  getStockCritico() {
    return this.inventarioService.getStockCritico();
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post('movimientos')
  registrarMovimiento(
    @Body() dto: CreateMovimientoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventarioService.registrarMovimiento(dto, user.id);
  }
}
