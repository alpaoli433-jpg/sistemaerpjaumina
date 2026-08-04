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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post()
  create(
    @Body() dto: CreateProveedorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proveedoresService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProveedorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proveedoresService.update(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.proveedoresService.remove(id, user.id);
  }
}
