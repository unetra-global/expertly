import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { PaginationMeta } from '@expertly/types';
import { QueryEventsDto } from './dto/query-events.dto';

const EVENT_TTL = 300;        // 5 min
const EVENT_DETAIL_TTL = 600; // 10 min

// NEVER select embedding column
const EVENT_LIST_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'location, is_virtual, virtual_url, capacity, status, speakers, ' +
  'created_at, updated_at';

@Injectable()
export class EventsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
  ) {}

  async getList(
    dto: QueryEventsDto,
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 50);
    const offset = (page - 1) * limit;

    const cacheKey = this.cache.buildKey(
      'events',
      'list',
      `p${page}l${limit}${dto.upcoming ?? ''}`,
    );

    return this.cache.getOrFetch(
      cacheKey,
      async () => {
        let query = this.supabase.adminClient
          .from('events')
          .select(EVENT_LIST_FIELDS, { count: 'exact' })
          .in('status', ['published', 'completed'])
          .range(offset, offset + limit - 1)
          .order('start_date', { ascending: true });

        if (dto.upcoming) {
          query = query.gt('start_date', new Date().toISOString());
        }

        const { data, error, count } = await query;
        if (error) throw error;

        const total = count ?? 0;
        const totalPages = Math.ceil(total / limit);
        return {
          data: data ?? [],
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        };
      },
      EVENT_TTL,
    );
  }

  async getBySlug(slug: string): Promise<unknown> {
    const cacheKey = this.cache.buildKey('events', 'detail', slug);

    const result = await this.cache.getOrFetch<unknown | null>(
      cacheKey,
      async () => {
        const { data, error } = await this.supabase.adminClient
          .from('events')
          .select(EVENT_LIST_FIELDS)
          .eq('slug', slug)
          .in('status', ['published', 'completed'])
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      EVENT_DETAIL_TTL,
    );

    if (!result) {
      throw new NotFoundException(`Event '${slug}' not found`);
    }

    return result;
  }
}
