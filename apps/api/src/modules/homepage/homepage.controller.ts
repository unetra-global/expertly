import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { HomepageService } from './homepage.service';

@Controller('homepage')
@Public()
export class HomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Get()
  getHomepageData(): Promise<unknown> {
    return this.homepage.getHomepageData();
  }
}
