import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { EmpleadoEstado } from '@prisma/client';

export class CreateEmpleadoDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsEnum(EmpleadoEstado)
  status?: EmpleadoEstado;
}
