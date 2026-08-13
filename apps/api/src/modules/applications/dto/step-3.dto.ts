import { IsOptional, IsArray, IsString } from 'class-validator';

export class Step3Dto {
  @IsOptional()
  @IsString()
  primaryServiceId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryServiceIds?: string[];

  @IsOptional()
  achievements?: unknown[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careerHighlights?: string[];
}
