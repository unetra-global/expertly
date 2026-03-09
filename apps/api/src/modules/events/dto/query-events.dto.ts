import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  upcoming?: boolean;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  sort?: string; // 'date_asc' | 'date_desc'

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  // Backward compatibility for older clients that sent a single date.
  @IsOptional()
  @IsDateString()
  date?: string;
}
