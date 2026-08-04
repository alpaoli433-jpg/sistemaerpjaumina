import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsString()
  location: string;

  @IsDateString()
  eventDate: string;

  @IsInt()
  @Min(1)
  guestsCount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  serviceHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositPaid?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  recipeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  staffIds?: string[];
}
