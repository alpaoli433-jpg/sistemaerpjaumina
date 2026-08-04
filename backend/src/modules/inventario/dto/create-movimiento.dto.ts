import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MovimientoTipo } from '@prisma/client';

export class CreateMovimientoDto {
  @IsString()
  productoId: string;

  @IsEnum(MovimientoTipo)
  tipo: MovimientoTipo;

  // Para ENTRADA/SALIDA: cantidad a mover. Para AJUSTE: nuevo stock absoluto.
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
