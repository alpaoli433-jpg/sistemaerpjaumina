import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { Unit } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(Unit)
  unit: Unit;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;
}
