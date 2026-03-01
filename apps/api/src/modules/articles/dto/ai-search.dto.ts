import { IsString, MinLength } from 'class-validator';

export class ArticleAiSearchDto {
  @IsString()
  @MinLength(3)
  query!: string;
}
