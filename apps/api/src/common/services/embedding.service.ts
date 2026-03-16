import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Provider-agnostic embedding service.
 *
 * Configure via env:
 *   EMBEDDING_PROVIDER=google   (default) → gemini-embedding-001, 768 dims
 *   EMBEDDING_PROVIDER=openai             → text-embedding-3-small, 1536 dims
 *
 * The DB vector columns must match the provider's output dimension.
 * Default setup uses Google (768). If you switch providers, re-run the SQL
 * migration to change vector column sizes and re-embed all records.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly provider: 'google' | 'openai';

  private googleApiKey: string | null = null;
  private openai: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    this.provider =
      (this.config.get<string>('EMBEDDING_PROVIDER') as 'google' | 'openai') ??
      'google';

    if (this.provider === 'google') {
      const apiKey =
        this.config.get<string>('GOOGLE_AI_API_KEY') ??
        this.config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
      if (!apiKey) {
        this.logger.warn(
          'GOOGLE_AI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY not set — embeddings disabled',
        );
      } else {
        this.googleApiKey = apiKey;
        this.logger.log('EmbeddingService ready (google/gemini-embedding-001, 768 dims)');
      }
    } else {
      const apiKey = this.config.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn(
          'OPENAI_API_KEY not set — embeddings will be disabled',
        );
      } else {
        this.openai = new OpenAI({ apiKey });
        this.logger.log('EmbeddingService ready (openai/text-embedding-3-small, 1536 dims)');
      }
    }
  }

  isAvailable(): boolean {
    return this.provider === 'google' ? !!this.googleApiKey : !!this.openai;
  }

  /** Returns null on failure — callers should handle gracefully. */
  async embed(text: string): Promise<number[] | null> {
    if (!text.trim()) return null;

    try {
      if (this.provider === 'google' && this.googleApiKey) {
        return await this.embedWithGoogle(text);
      }
      if (this.provider === 'openai' && this.openai) {
        return await this.embedWithOpenAI(text);
      }
      this.logger.warn('No embedding provider configured');
      return null;
    } catch (err) {
      this.logger.error('Embedding generation failed', err);
      return null;
    }
  }

  private async embedWithGoogle(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${this.googleApiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Google Embedding API ${resp.status}: ${body}`);
    }
    const json = (await resp.json()) as { embedding?: { values: number[] } };
    if (!json.embedding?.values) throw new Error('Google returned no embedding');
    return json.embedding.values;
  }

  private async embedWithOpenAI(text: string): Promise<number[]> {
    const resp = await this.openai!.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    const vector = resp.data[0]?.embedding;
    if (!vector) throw new Error('OpenAI returned no embedding vector');
    return vector;
  }
}
