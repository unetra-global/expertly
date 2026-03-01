import { IsOptional, IsUUID, IsArray } from 'class-validator';

export class Step3Dto {
  @IsOptional()
  @IsUUID()
  primaryServiceId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  secondaryServiceIds?: string[];

  @IsOptional()
  engagements?: Record<string, unknown>;

  @IsOptional()
  availability?: Record<string, unknown>;
}
