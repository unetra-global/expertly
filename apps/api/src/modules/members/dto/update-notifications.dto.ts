import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  email_on_consultation?: boolean;

  @IsOptional()
  @IsBoolean()
  email_on_article_comment?: boolean;

  @IsOptional()
  @IsBoolean()
  email_on_event_rsvp?: boolean;
}
