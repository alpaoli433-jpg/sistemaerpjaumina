import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateIngredientDto, userId: string) {
    const ingredient = await this.prisma.ingredient.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CREATE_INGREDIENT',
      entity: 'Ingredient',
      details: `Creó el insumo: ${ingredient.name}.`,
    });
    return ingredient;
  }

  findAll() {
    return this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException('Insumo no encontrado');
    }
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto, userId: string) {
    await this.findOne(id);
    const ingredient = await this.prisma.ingredient.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_INGREDIENT',
      entity: 'Ingredient',
      details: `Actualizó el insumo: ${ingredient.name}.`,
    });
    return ingredient;
  }

  async remove(id: string, userId: string) {
    const ingredient = await this.findOne(id);
    await this.prisma.ingredient.delete({ where: { id } });
    await this.audit.log({
      userId,
      action: 'DELETE_INGREDIENT',
      entity: 'Ingredient',
      details: `Eliminó el insumo: ${ingredient.name}.`,
    });
    return { id };
  }
}
