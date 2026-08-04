import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CerrarCajaDto {
  @IsInt()
  @Min(0)
  closingAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
