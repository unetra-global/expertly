import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';

export class Step2Dto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  firmName?: string;

  @IsOptional()
  @IsString()
  firmSize?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFeeMinUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFeeMaxUsd?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @IsOptional()
  @IsArray()
  credentials?: unknown[];

  @IsOptional()
  @IsArray()
  workExperience?: unknown[];

  @IsOptional()
  @IsArray()
  education?: unknown[];
}
