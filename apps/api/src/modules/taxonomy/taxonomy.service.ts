import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';

const TAXONOMY_TTL = 3600; // 1 hour

interface Category {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  sort_order: number;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  regions: string[];
  sort_order: number;
}

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
  ) {}

  async getCategories(): Promise<Category[]> {
    const key = this.cache.buildKey('taxonomy', 'categories');

    return this.cache.getOrFetch<Category[]>(
      key,
      async () => {
        const { data, error } = await this.supabase.adminClient
          .from('categories')
          .select('id, name, slug, domain, sort_order')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        return (data ?? []) as Category[];
      },
      TAXONOMY_TTL,
    );
  }

  async getServices(categoryId?: string): Promise<Service[]> {
    const cacheSegment = categoryId ?? 'all';
    const key = this.cache.buildKey('taxonomy', 'services', cacheSegment);

    return this.cache.getOrFetch<Service[]>(
      key,
      async () => {
        let query = this.supabase.adminClient
          .from('services')
          .select('id, category_id, name, slug, regions, sort_order')
          .eq('is_active', true)
          .order('sort_order');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data ?? []) as Service[];
      },
      TAXONOMY_TTL,
    );
  }

  async getServiceBySlug(slug: string): Promise<Service> {
    const key = this.cache.buildKey('taxonomy', 'service', slug);

    const result = await this.cache.getOrFetch<Service | null>(
      key,
      async () => {
        const { data, error } = await this.supabase.adminClient
          .from('services')
          .select('id, category_id, name, slug, regions, sort_order')
          .eq('slug', slug)
          .single();

        if (error) return null;
        return data as Service;
      },
      TAXONOMY_TTL,
    );

    if (!result) {
      throw new NotFoundException(`Service with slug '${slug}' not found`);
    }

    return result;
  }
}
