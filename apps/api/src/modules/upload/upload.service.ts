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
const AVATAR_SIZE = 1200;

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
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'entropy' })
      .sharpen(1.1)
      .webp({ quality: 90 })
      .toBuffer();

    const path = `${userId}/profile.webp`;
    const { error } = await this.supabase.adminClient.storage
      .from('avatars')
      .upload(path, processed, { contentType: 'image/webp', upsert: true });
    if (error) throw error;

    const { data } = this.supabase.adminClient.storage.from('avatars').getPublicUrl(path);
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

    const path = `${contextId}/cover.webp`;
    const { error } = await this.supabase.adminClient.storage
      .from('article-images')
      .upload(path, processed, { contentType: 'image/webp', upsert: true });
    if (error) throw error;

    const { data } = this.supabase.adminClient.storage.from('article-images').getPublicUrl(path);
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
    const path = `${userId}/${docType}/${fileId}.${ext}`;
    const { error } = await this.supabase.adminClient.storage
      .from('documents')
      .upload(path, buffer, { contentType: type.mime, upsert: false });
    if (error) throw error;

    // Documents are private — return a signed URL (1 year expiry)
    const { data: signedData, error: signErr } = await this.supabase.adminClient.storage
      .from('documents')
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signedData) throw signErr ?? new Error('Failed to create signed URL');
    return { url: signedData.signedUrl };
  }
}
