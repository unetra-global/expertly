import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsUUID,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { COUNTRY_NAMES, MEMBER_TIERS } from '@expertly/utils';
import { Type } from 'class-transformer';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  profile_photo_url?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  city?: string;


  @IsOptional()
  @IsIn(COUNTRY_NAMES)
  country?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  linkedin_url?: string;

  @IsOptional()
  @IsObject()
  availability?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  engagement?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  credentials?: unknown[];

  @IsOptional()
  @IsArray()
  testimonials?: unknown[];

  @IsOptional()
  @IsArray()
  work_experience?: unknown[];

  @IsOptional()
  @IsArray()
  education?: unknown[];

  @IsOptional()
  @IsIn(MEMBER_TIERS as readonly string[])
  member_tier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  @Type(() => Number)
  years_of_experience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  consultation_fee_min_usd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  consultation_fee_max_usd?: number;

  @IsOptional()
  @IsUUID()
  primary_service_id?: string;
}
