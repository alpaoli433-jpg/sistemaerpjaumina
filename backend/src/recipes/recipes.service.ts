import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

const RECIPE_INCLUDE = {
  ingredients: { include: { ingredient: true } },
} as const;

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateRecipeDto, userId: string) {
    const { ingredients, ...recipe } = dto;

    const created = await this.prisma.recipe.create({
      data: {
        ...recipe,
        ingredients: {
          create: ingredients.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
        },
      },
      include: RECIPE_INCLUDE,
    });
    await this.audit.log({
      userId,
      action: 'CREATE_RECIPE',
      entity: 'Recipe',
      details: `Creó la receta: ${created.name}.`,
    });
    return created;
  }

  findAll() {
    return this.prisma.recipe.findMany({
      include: RECIPE_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: RECIPE_INCLUDE,
    });
    if (!recipe) {
      throw new NotFoundException('Receta no encontrada');
    }
    return recipe;
  }

  async update(id: string, dto: UpdateRecipeDto, userId: string) {
    await this.findOne(id);
    const { ingredients, ...recipe } = dto;

    const updated = await this.prisma.recipe.update({
      where: { id },
      data: {
        ...recipe,
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients.map((item) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity,
            })),
          },
        }),
      },
      include: RECIPE_INCLUDE,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_RECIPE',
      entity: 'Recipe',
      details: `Actualizó la receta: ${updated.name}.`,
    });
    return updated;
  }

  async remove(id: string, userId: string) {
    const recipe = await this.findOne(id);
    await this.prisma.recipe.delete({ where: { id } });
    await this.audit.log({
      userId,
      action: 'DELETE_RECIPE',
      entity: 'Recipe',
      details: `Eliminó la receta: ${recipe.name}.`,
    });
    return { id };
  }
}
