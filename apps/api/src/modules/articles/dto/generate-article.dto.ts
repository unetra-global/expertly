import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QaItemDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class GenerateArticleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaItemDto)
  qa!: QaItemDto[];

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
