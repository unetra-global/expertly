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
const AVATAR_THUMB_SIZE = 256; // profile photos stored as 256×256 base64 in the DB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // Converts uploaded file to a 256×256 base64 data URI.
  // No CDN upload — profile photos live entirely in the database.
  async uploadAvatar(
    _userId: string,
    buffer: Buffer,
    _originalName: string,
  ): Promise<{ base64: string }> {
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_IMAGE_TYPES.includes(type.mime)) {
      throw new BadRequestException('INVALID_FILE_TYPE');
    }

    const thumb = await sharp(buffer)
      .resize(AVATAR_THUMB_SIZE, AVATAR_THUMB_SIZE, { fit: 'cover', position: 'entropy' })
      .webp({ quality: 80 })
      .toBuffer();

    return { base64: `data:image/webp;base64,${thumb.toString('base64')}` };
  }

  // Fetches a remote image URL server-side (avoids browser CORS) and returns
  // a 256×256 base64 data URI.  Used for LinkedIn profile photo imports.
  async avatarBase64FromUrl(imageUrl: string): Promise<{ base64: string }> {
    let buffer: Buffer;
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buffer = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      this.logger.warn(`avatarBase64FromUrl fetch failed: ${String(err)}`);
      throw new BadRequestException('FETCH_FAILED');
    }

    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }

    const thumb = await sharp(buffer)
      .resize(AVATAR_THUMB_SIZE, AVATAR_THUMB_SIZE, { fit: 'cover', position: 'entropy' })
      .webp({ quality: 80 })
      .toBuffer();

    return { base64: `data:image/webp;base64,${thumb.toString('base64')}` };
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
