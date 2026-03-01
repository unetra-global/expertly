import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { fromBuffer as fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;  // 10 MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async uploadAvatar(
    userId: string,
    buffer: Buffer,
    originalName: string,
  ): Promise<{ url: string }> {
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_IMAGE_TYPES.includes(type.mime)) {
      throw new BadRequestException('INVALID_FILE_TYPE');
    }

    const processed = await sharp(buffer)
      .resize(400, 400, { fit: 'cover', position: 'entropy' })
      .webp({ quality: 85 })
      .toBuffer();

    const path = `avatars/${userId}/profile.webp`;
    const { error } = await this.supabase.adminClient.storage
      .from('uploads')
      .upload(path, processed, { contentType: 'image/webp', upsert: true });
    if (error) throw error;

    const { data } = this.supabase.adminClient.storage.from('uploads').getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async uploadArticleImage(
    contextId: string,
    buffer: Buffer,
    originalName: string,
  ): Promise<{ url: string }> {
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_IMAGE_TYPES.includes(type.mime)) {
      throw new BadRequestException('INVALID_FILE_TYPE');
    }

    const processed = await sharp(buffer)
      .resize(1200, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const path = `article-images/${contextId}/cover.webp`;
    const { error } = await this.supabase.adminClient.storage
      .from('uploads')
      .upload(path, processed, { contentType: 'image/webp', upsert: true });
    if (error) throw error;

    const { data } = this.supabase.adminClient.storage.from('uploads').getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async uploadDocument(
    userId: string,
    docType: 'credentials' | 'testimonials',
    buffer: Buffer,
    originalName: string,
  ): Promise<{ url: string }> {
    if (buffer.length > MAX_DOC_SIZE) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_DOCUMENT_TYPES.includes(type.mime)) {
      throw new BadRequestException('INVALID_FILE_TYPE');
    }

    const ext = type.ext;
    const fileId = randomUUID();
    const path = `documents/${userId}/${docType}/${fileId}.${ext}`;
    const { error } = await this.supabase.adminClient.storage
      .from('uploads')
      .upload(path, buffer, { contentType: type.mime, upsert: false });
    if (error) throw error;

    const { data } = this.supabase.adminClient.storage.from('uploads').getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
