import { IsObject } from 'class-validator';

export class SubmitDto {
  @IsObject()
  consents!: Record<string, { accepted_at: string; version: string }>;
}
