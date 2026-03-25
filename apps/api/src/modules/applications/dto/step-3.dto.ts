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
  @IsArray()
  @IsString({ each: true })
  keyEngagements?: string[];

  @IsOptional()
  engagements?: Record<string, unknown>;

  @IsOptional()
  availability?: Record<string, unknown>;
}
