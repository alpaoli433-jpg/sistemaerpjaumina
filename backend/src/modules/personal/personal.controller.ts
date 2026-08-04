import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PersonalService } from './personal.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateMovimientoEmpleadoDto } from './dto/create-movimiento-empleado.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post()
  create(
    @Body() dto: CreateEmpleadoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personalService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.personalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmpleadoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personalService.update(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.personalService.remove(id, user.id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post(':id/movimientos')
  addMovimiento(
    @Param('id') id: string,
    @Body() dto: CreateMovimientoEmpleadoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personalService.addMovimiento(id, dto, user.id);
  }
}
