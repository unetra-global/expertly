import { IsOptional, IsString, IsInt, IsBoolean, IsUUID, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryMembersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsString()
  memberTier?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minYearsExperience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxHourlyRate?: number;

  @IsOptional()
  @IsIn(['fee_asc', 'fee_desc', 'experience_desc'])
  sort?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  isVerified?: boolean;
}
