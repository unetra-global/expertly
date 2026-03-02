import { Module } from '@nestjs/common';
import { EmbeddingProcessor } from './embedding.processor';

@Module({
  providers: [EmbeddingProcessor],
})
export class AiModule {}
