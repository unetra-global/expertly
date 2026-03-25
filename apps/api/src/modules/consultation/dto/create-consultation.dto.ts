import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  memberId!: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsString()
  @MinLength(5)
  subject!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;
}
