import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EmpleadoMovimientoTipo } from '@prisma/client';

export class CreateMovimientoEmpleadoDto {
  @IsEnum(EmpleadoMovimientoTipo)
  tipo: EmpleadoMovimientoTipo;

  @IsInt()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
