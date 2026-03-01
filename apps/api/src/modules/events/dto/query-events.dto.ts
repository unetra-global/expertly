import { IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
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
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  upcoming?: boolean;
}
