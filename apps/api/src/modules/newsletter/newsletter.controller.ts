import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  IsString,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';
import { AuthUser } from '@expertly/types';

class SubscribeDto {
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
   * Authenticated — subscribes the current user to digest categories.
   */
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @HttpCode(201)
  subscribe(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubscribeDto,
  ): Promise<{ message: string }> {
    return this.newsletter.subscribe({
      userId: user.dbId,
      email: user.email,
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
