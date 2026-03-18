import { IsOptional, IsString, MaxLength } from 'class-validator';

export class Step4Dto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivationWhy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivationEngagement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivationUnique?: string;
}
