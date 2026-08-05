import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// `take`/`skip` opcionales (mismo estilo que auditoria/dto/query-auditoria.dto.ts):
// si no vienen, el listado devuelve el array completo tal cual antes (lo siguen
// necesitando los selectores de otros módulos, ej. Productos/Clientes en
// Compras/Ventas); si vienen, el servicio pagina y devuelve el sobre
// { data, total, take, skip }.
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}
