import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import { Queue } from 'bullmq';
import { SupabaseService } from '../../common/services/supabase.service';
import { CacheService } from '../../common/services/cache.service';
import { QUEUE_NAMES, QUEUE_JOB_TYPES, getQueueConnection, isQueueDisabled } from '../../config/queue.config';
import { PaginationMeta } from '@expertly/types';
import { resolveCountryName, slugify, randomSuffix } from '@expertly/utils';
import { QueryEventsDto } from './dto/query-events.dto';

const EVENT_TTL = 300;        // 5 min
const EVENT_DETAIL_TTL = 600; // 10 min

// NEVER select embedding column
const EVENT_LIST_FIELDS =
  'id, title, slug, description, cover_image_url, start_date, end_date, ' +
  'country, city, venue_name, event_format, is_published, is_featured, ' +
  'registration_url, tags, event_type';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly aiQueue: Queue | null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {
    this.aiQueue = isQueueDisabled(config)
      ? null
      : new Queue(QUEUE_NAMES.AI, { connection: getQueueConnection(config) });
  }

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

  // ── Ops ───────────────────────────────────────────────────────────────────

  async listOpsEvents() {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .select(
        'id, slug, title, short_description, description, event_format, ' +
        'country, city, venue_name, start_date, end_date, ' +
        'registration_url, cover_image_url, is_published, is_featured, tags, ' +
        'created_at, updated_at',
      )
      .order('start_date', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async importEvents(buffer: Buffer, filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      throw new BadRequestException('File must be .xlsx, .xls or .csv');
    }

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    if (rows.length === 0) throw new BadRequestException('Spreadsheet is empty');

    const created: string[] = [];
    const errors: { row: number; error: string }[] = [];

    const normalise = (v: unknown) =>
      String(v ?? '').toLowerCase().replace(/[\s_-]+/g, '');

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const r: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        r[normalise(k)] = String(v ?? '').trim();
      }

      const title = r['title'] ?? r['eventname'] ?? r['name'] ?? '';
      const startDate = r['startdate'] ?? r['start'] ?? '';

      if (!title) { errors.push({ row: i + 2, error: 'Missing required field: title' }); continue; }
      if (!startDate) { errors.push({ row: i + 2, error: 'Missing required field: start date' }); continue; }

      const parsedStart = new Date(startDate);
      if (isNaN(parsedStart.getTime())) { errors.push({ row: i + 2, error: `Invalid start date: "${startDate}"` }); continue; }

      const endDateStr = r['enddate'] ?? r['end'] ?? '';
      const parsedEnd = endDateStr ? new Date(endDateStr) : null;
      const format = r['format'] ?? r['eventformat'] ?? 'online';
      const tags = (r['tags'] ?? '').split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
      const ne = (v: string) => v || null;

      try {
        const { data, error } = await this.supabase.adminClient
          .from('events')
          .insert({
            slug: slugify(title) + '-' + randomSuffix(),
            title,
            short_description: ne(r['shortdescription'] ?? r['shortdesc'] ?? ''),
            description: r['description'] ?? r['desc'] ?? '',
            event_format: ['online', 'in_person', 'hybrid'].includes(format) ? format : 'online',
            country: ne(r['country'] ?? ''),
            city: ne(r['city'] ?? ''),
            venue_name: ne(r['venue'] ?? r['venuename'] ?? ''),
            start_date: parsedStart.toISOString(),
            end_date: parsedEnd?.toISOString() ?? null,
            registration_url: ne(r['registrationurl'] ?? r['url'] ?? ''),
            cover_image_url: ne(r['coverimageurl'] ?? r['image'] ?? ''),
            tags,
            is_published: ['true', 'yes', '1'].includes((r['ispublished'] ?? r['published'] ?? '').toLowerCase()),
            source: 'ops_import',
          })
          .select('id, title')
          .single();

        if (error) throw new Error(error.message);
        created.push((data as unknown as { id: string }).id);
      } catch (err) {
        errors.push({ row: i + 2, error: (err as Error).message });
      }
    }

    await this.cache.delByPattern('expertly:events:*');
    return { imported: created.length, failed: errors.length, errors };
  }

  async createEvent(body: Record<string, unknown>) {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .insert({
        slug: slugify(String(body.title ?? '')) + '-' + randomSuffix(),
        title: body.title,
        short_description: body.shortDescription ?? null,
        description: body.description ?? '',
        event_format: body.format ?? 'online',
        country: body.country ?? null,
        city: body.city ?? null,
        venue_name: body.venue ?? null,
        start_date: body.startDate,
        end_date: body.endDate ?? null,
        registration_url: body.registrationUrl ?? null,
        cover_image_url: body.coverImageUrl ?? null,
        tags: body.tags ?? [],
        is_published: body.isPublished ?? false,
        source: 'ops',
      })
      .select('id, slug, title, short_description, event_format, country, city, start_date, is_published')
      .single();

    if (error) throw new BadRequestException(error.message);

    await this.aiQueue?.add(QUEUE_JOB_TYPES.GENERATE_EMBEDDING, {
      entityType: 'event',
      entityId: (data as unknown as { id: string }).id,
    });

    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async publishEvent(id: string, isPublished: boolean) {
    const { data, error } = await this.supabase.adminClient
      .from('events')
      .update({ is_published: isPublished })
      .eq('id', id)
      .select('id, is_published')
      .single();

    if (error || !data) throw new BadRequestException(error?.message ?? 'Event not found');
    await this.cache.delByPattern('expertly:events:*');
    return data;
  }

  async updateEvent(id: string, body: Record<string, unknown>) {
    const fieldMap: Record<string, string> = {
      title: 'title', shortDescription: 'short_description', description: 'description',
      format: 'event_format', country: 'country', city: 'city', venue: 'venue_name',
      startDate: 'start_date', endDate: 'end_date', registrationUrl: 'registration_url',
      coverImageUrl: 'cover_image_url', isPublished: 'is_published', isFeatured: 'is_featured', tags: 'tags',
    };
    const updates: Record<string, unknown> = {};
    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (camel in body) updates[snake] = body[camel];
    }

    const { data, error } = await this.supabase.adminClient
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('id, slug, title, short_description, event_format, country, city, start_date, is_published')
      .single();

    if (error) throw new BadRequestException(error.message);
    await this.cache.delByPattern('expertly:events:*');

    if (['title', 'description', 'format', 'country', 'city'].some((f) => f in body)) {
      await this.aiQueue?.add(
        QUEUE_JOB_TYPES.GENERATE_EMBEDDING,
        { entityType: 'event', entityId: id },
        { jobId: `embed:event:${id}` },
      );
    }

    return data;
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase.adminClient.from('events').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
    await this.cache.delByPattern('expertly:events:*');
    return { message: 'Event deleted' };
  }
}
