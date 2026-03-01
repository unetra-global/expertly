import { IsString, IsOptional, IsBoolean, IsUUID, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AiSearchFiltersDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class AiSearchDto {
  @IsString()
  @MinLength(3)
  query!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiSearchFiltersDto)
  filters?: AiSearchFiltersDto;
}
