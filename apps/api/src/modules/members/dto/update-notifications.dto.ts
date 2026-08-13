import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  article_status?: boolean;

  @IsOptional()
  @IsBoolean()
  platform_updates?: boolean;
}
