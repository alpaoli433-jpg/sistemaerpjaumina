import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGastoDto {
  @IsString()
  @MinLength(2)
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsInt()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;
}
