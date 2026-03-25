import { IsOptional, IsString, IsInt, IsBoolean, IsUUID, Min, Max, IsIn } from 'class-validator';
import { MEMBER_TIERS } from '@expertly/utils';
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

  /** Comma-separated service UUIDs for multi-select filtering */
  @IsOptional()
  @IsString()
  serviceIds?: string;

  @IsOptional()
  @IsIn(MEMBER_TIERS as readonly string[])
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
