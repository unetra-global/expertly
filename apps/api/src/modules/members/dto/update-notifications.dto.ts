import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for PATCH /members/me/notifications
 *
 * Only three notification preferences are user-configurable:
 *   - article_status:    email when article is approved or rejected
 *   - regulatory_nudges: prompt to write about regulatory changes
 *   - platform_updates: platform news and feature announcements
 *
 * consultation_requests and membership_reminders have been removed
 * from user-facing settings per product decision.
 */
export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  article_status?: boolean;

  @IsOptional()
  @IsBoolean()
  regulatory_nudges?: boolean;

  @IsOptional()
  @IsBoolean()
  platform_updates?: boolean;
}
