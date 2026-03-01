import { IsEnum } from 'class-validator';

export class UpdateConsultationStatusDto {
  @IsEnum(['responded', 'closed'])
  status!: 'responded' | 'closed';
}
