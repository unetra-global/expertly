import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateConsultationDto {
  @IsUUID()
  memberId!: string;

  @IsOptional()
  @IsUUID()
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
