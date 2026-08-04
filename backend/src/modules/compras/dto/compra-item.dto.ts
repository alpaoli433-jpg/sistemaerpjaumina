import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CompraItemDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsInt()
  @Min(0)
  unitCost: number;
}
