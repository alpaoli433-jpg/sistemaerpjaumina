import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { VentaStatus } from '@prisma/client';
import { VentaItemDto } from './venta-item.dto';

export class CreateVentaDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsEnum(VentaStatus)
  status?: VentaStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items: VentaItemDto[];
}
