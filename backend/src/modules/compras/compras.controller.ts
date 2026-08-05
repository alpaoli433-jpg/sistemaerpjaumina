import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginationQueryDto } from '../../shared/pagination/pagination-query.dto';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post()
  create(@Body() dto: CreateCompraDto, @CurrentUser() user: AuthenticatedUser) {
    return this.comprasService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.comprasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comprasService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/anular')
  anular(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.comprasService.anular(id, user.id);
  }
}
