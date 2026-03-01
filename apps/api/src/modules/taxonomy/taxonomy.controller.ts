import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
@Public()
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get('categories')
  getCategories(): Promise<unknown[]> {
    return this.taxonomy.getCategories();
  }

  @Get('services')
  getServices(@Query('categoryId') categoryId?: string): Promise<unknown[]> {
    return this.taxonomy.getServices(categoryId);
  }

  @Get('services/:slug')
  getServiceBySlug(@Param('slug') slug: string): Promise<unknown> {
    return this.taxonomy.getServiceBySlug(slug);
  }
}
