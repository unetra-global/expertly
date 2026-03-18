import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { ApplicationsService } from './applications.service';
import { Step1Dto } from './dto/step-1.dto';
import { Step2Dto } from './dto/step-2.dto';
import { Step3Dto } from './dto/step-3.dto';
import { Step4Dto } from './dto/step-4.dto';
import { SubmitDto } from './dto/submit.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.applications.getMe(user);
  }

  @Post()
  createOrResume(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.applications.createOrResume(user);
  }

  @Patch(':id/step-1')
  updateStep1(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: Step1Dto,
  ): Promise<unknown> {
    return this.applications.updateStep1(user, id, dto);
  }

  @Patch(':id/step-2')
  updateStep2(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: Step2Dto,
  ): Promise<unknown> {
    return this.applications.updateStep2(user, id, dto);
  }

  @Patch(':id/step-3')
  updateStep3(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: Step3Dto,
  ): Promise<unknown> {
    return this.applications.updateStep3(user, id, dto);
  }

  @Patch(':id/step-4')
  updateStep4(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: Step4Dto,
  ): Promise<unknown> {
    return this.applications.updateStep4(user, id, dto);
  }

  @Post(':id/submit')
  submit(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitDto,
  ): Promise<unknown> {
    return this.applications.submit(user, id, dto);
  }
}
