import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QaItemDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class AttachmentDto {
  @IsIn(['text', 'image'])
  type!: 'text' | 'image';

  @IsString()
  content!: string;

  @IsString()
  filename!: string;
}

export class GenerateArticleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaItemDto)
  qa!: QaItemDto[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
