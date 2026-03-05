import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _adminClient!: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');

    this._adminClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase admin client initialised');
  }

  get adminClient(): SupabaseClient {
    return this._adminClient;
  }

  async revalidatePath(path: string): Promise<void> {
    const url = this.config.get<string>('NEXT_REVALIDATION_URL');
    const secret = this.config.get<string>('NEXT_REVALIDATION_SECRET');

    if (!url || !secret) {
      this.logger.warn('NEXT_REVALIDATION_URL or NEXT_REVALIDATION_SECRET not set — skipping revalidation');
      return;
    }

    try {
      await axios.post(url, { path, secret }, {
        timeout: 5000,
      });
      this.logger.debug(`Revalidated path: ${path}`);
    } catch (err) {
      this.logger.error(`Failed to revalidate path ${path}`, err);
    }
  }
}
