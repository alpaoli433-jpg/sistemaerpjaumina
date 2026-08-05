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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post()
  create(
    @Body() dto: CreateServicioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.serviciosService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServicioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.serviciosService.update(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.serviciosService.remove(id, user.id);
  }
}
