import { IsString } from 'class-validator';

export class ServiceChangeDto {
  @IsString()
  serviceId!: string;
}
