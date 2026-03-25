import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { PaginationMeta } from '@expertly/types';
import { resolveCountryName } from '@expertly/utils';
import { QueryEventsDto } from './dto/query-events.dto';

const EVENT_TTL = 300;        // 5 min
const EVENT_DETAIL_TTL = 600; // 10 min

// NEVER select embedding column
const EVENT_LIST_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'country, city, venue_name, event_format, is_published, is_featured, ' +
  'registration_url, capacity, tags, event_type';

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
    const sortAsc = dto.sort !== 'date_desc';

    const cacheKey = this.cache.buildKey(
      'events',
      'list',
      `p${page}l${limit}${dto.upcoming ?? ''}${dto.q ?? ''}${dto.country ?? ''}${dto.format ?? ''}${dto.sort ?? ''}${dto.startDateFrom ?? ''}${dto.startDateTo ?? ''}${dto.date ?? ''}`,
    );

    return this.cache.getOrFetch(
      cacheKey,
      async () => {
        let query = this.supabase.adminClient
          .from('events')
          .select(EVENT_LIST_FIELDS, { count: 'exact' })
          .range(offset, offset + limit - 1)
          .order('start_date', { ascending: sortAsc });

        // Status filter: show published events (use is_published if set, fallback to status)
        query = query.or('is_published.eq.true,status.eq.published');

        if (dto.upcoming) {
          query = query.gt('start_date', new Date().toISOString());
        }

        if (dto.q) {
          query = query.ilike('title', `%${dto.q}%`);
        }

        if (dto.country) {
          const canonical = resolveCountryName(dto.country);
          if (canonical) {
            query = query.eq('country', canonical);
          }
        }

        if (dto.format) {
          if (dto.format === 'online') {
            query = query.in('event_format', ['online', 'virtual']);
          } else {
            query = query.eq('event_format', dto.format);
          }
        }

        const startDateFrom = dto.startDateFrom ?? dto.date;
        const startDateTo = dto.startDateTo ?? dto.date;
        if (startDateFrom) {
          query = query.gte('start_date', `${startDateFrom}T00:00:00.000Z`);
        }
        if (startDateTo) {
          query = query.lte('start_date', `${startDateTo}T23:59:59.999Z`);
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
          .or('is_published.eq.true,status.eq.published')
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
