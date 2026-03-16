import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class AiSearchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  query!: string;

  @IsOptional()
  @IsString()
  @IsIn(['members', 'articles', 'events', 'all'])
  scope?: 'members' | 'articles' | 'events' | 'all';
}
