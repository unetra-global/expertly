import { IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryArticlesDto {
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
  @IsEnum(['draft', 'submitted', 'under_review', 'published', 'rejected', 'archived'])
  status?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'read_time_asc', 'read_time_desc'])
  sort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minReadTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxReadTime?: number;
}
