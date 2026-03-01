import { IsUUID } from 'class-validator';

export class ServiceChangeDto {
  @IsUUID()
  serviceId!: string;
}
