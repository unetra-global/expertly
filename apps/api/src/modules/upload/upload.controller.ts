import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@expertly/types';
import { UploadService } from './upload.service';

interface MultipartFile {
  filename: string;
  mimetype: string;
  toBuffer: () => Promise<Buffer>;
}

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('avatar')
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @Req() req: FastifyRequest,
  ): Promise<{ base64: string }> {
    const file = await this.getFile(req);
    const buffer = await file.toBuffer();
    return this.upload.uploadAvatar(user.dbId, buffer, file.filename);
  }

  // Converts a remote image URL to a base64 data URI — used after LinkedIn import
  // so the photo is processed server-side (avoids browser CORS issues).
  @Post('avatar-from-url')
  async avatarBase64FromUrl(
    @CurrentUser() user: AuthUser,
    @Body('url') url: string,
  ): Promise<{ base64: string }> {
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new BadRequestException('A valid image URL is required');
    }
    return this.upload.avatarBase64FromUrl(user.dbId, url);
  }

  @Post('article-image')
  @Roles('member')
  async uploadArticleImage(
    @CurrentUser() user: AuthUser,
    @Req() req: FastifyRequest,
    @Query('contextId') contextId?: string,
  ): Promise<{ url: string }> {
    const file = await this.getFile(req);
    const buffer = await file.toBuffer();
    const id = contextId ?? `${user.dbId}-${Date.now()}`;
    return this.upload.uploadArticleImage(id, buffer, file.filename);
  }

  @Post('document')
  async uploadDocument(
    @CurrentUser() user: AuthUser,
    @Req() req: FastifyRequest,
    @Query('type') docType: 'credentials' | 'testimonials' = 'credentials',
  ): Promise<{ url: string }> {
    if (!['credentials', 'testimonials'].includes(docType)) {
      throw new BadRequestException('type must be credentials or testimonials');
    }
    const file = await this.getFile(req);
    const buffer = await file.toBuffer();
    return this.upload.uploadDocument(user.dbId, docType, buffer, file.filename);
  }

  // ─── Helper ─────────────────────────────────────────────────────────────

  private async getFile(req: FastifyRequest): Promise<MultipartFile> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }
    return data as unknown as MultipartFile;
  }
}
