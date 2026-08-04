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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Post()
  create(
    @Body() dto: CreateIngredientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ingredientsService.create(dto, user.id);
  }

  // Cualquier rol autenticado puede consultar stock (ADMIN, COORDINADOR, BARTENDER)
  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.COORDINADOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIngredientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ingredientsService.update(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ingredientsService.remove(id, user.id);
  }
}
