import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;
}
