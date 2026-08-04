import { IsNumber, IsString, Min } from 'class-validator';

export class RecipeIngredientDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;
}
