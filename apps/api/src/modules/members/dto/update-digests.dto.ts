import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsIn,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DigestSubscriptionItemDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsBoolean()
  isSubscribed!: boolean;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'fortnightly'])
  frequency?: 'daily' | 'weekly' | 'fortnightly';
}

export class UpdateDigestsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DigestSubscriptionItemDto)
  subscriptions!: DigestSubscriptionItemDto[];
}
