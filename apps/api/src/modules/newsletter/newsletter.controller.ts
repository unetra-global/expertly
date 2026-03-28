import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
} from '@nestjs/common';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';

class SubscribeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  /** At least one category must be selected. */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categoryIds!: string[];
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  /**
   * POST /newsletter/subscribe
   * Public — no auth required.
   * Inserts one row per selected category into guest_newsletter_subscriptions.
   */
  @Public()
  @Post('subscribe')
  @HttpCode(201)
  subscribe(@Body() dto: SubscribeDto): Promise<{ message: string }> {
    return this.newsletter.subscribe({
      name: dto.name,
      email: dto.email,
      categoryIds: dto.categoryIds,
    });
  }

  /**
   * GET /newsletter/categories
   * Public — returns all categories for the subscription dropdown.
   */
  @Public()
  @Get('categories')
  getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
    return this.newsletter.getCategories();
  }
}
