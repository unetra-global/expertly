import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationStatusDto } from './dto/update-status.dto';

@Controller('consultation-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationController {
  constructor(private readonly consultation: ConsultationService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateConsultationDto,
  ): Promise<unknown> {
    return this.consultation.create(user, dto);
  }

  @Get('received')
  @Roles('member')
  getReceived(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.consultation.getReceived(user);
  }

  @Get('sent')
  getSent(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.consultation.getSent(user);
  }

  @Patch(':id/status')
  @Roles('member')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateConsultationStatusDto,
  ): Promise<unknown> {
    return this.consultation.updateStatus(user, id, dto);
  }
}
