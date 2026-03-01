import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('member')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.dashboard.getStats(user);
  }
}
