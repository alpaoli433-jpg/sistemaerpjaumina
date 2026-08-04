import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

const RECIPE_INCLUDE = {
  ingredients: { include: { ingredient: true } },
} as const;

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRecipeDto) {
    const { ingredients, ...recipe } = dto;

    return this.prisma.recipe.create({
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

  async update(id: string, dto: UpdateRecipeDto) {
    await this.findOne(id);
    const { ingredients, ...recipe } = dto;

    return this.prisma.recipe.update({
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
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recipe.delete({ where: { id } });
  }
}
