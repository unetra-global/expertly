import { IsOptional, IsUUID, IsArray, IsString } from 'class-validator';

export class Step3Dto {
  @IsOptional()
  @IsUUID()
  primaryServiceId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
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
