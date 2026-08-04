import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  role: string;

  @IsNumber()
  @Min(0)
  dailyRate: number;

  @IsOptional()
  @IsString()
  phone?: string;
}
