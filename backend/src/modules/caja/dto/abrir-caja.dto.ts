import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AbrirCajaDto {
  @IsInt()
  @Min(0)
  openingAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
