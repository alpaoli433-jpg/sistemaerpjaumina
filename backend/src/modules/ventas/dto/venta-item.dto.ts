import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VentaItemDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  // Si se omite, se usa el Producto.salePrice vigente al momento de la venta.
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;
}
