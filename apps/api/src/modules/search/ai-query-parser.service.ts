import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateObject, type LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { COUNTRY_NAMES } from '@expertly/utils';

export interface ParsedQuery {
  intent: 'members' | 'articles' | 'events' | 'all';
  cleanQuery: string;
  filters: {
    city?: string | null;
    country?: string | null;
    dateFrom?: string | null;    // YYYY-MM-DD
    dateTo?: string | null;      // YYYY-MM-DD
    serviceCategory?: string | null;
    isVirtual?: boolean | null;  // true when user says "online", "virtual", "remote"
  };
}

const PARSED_QUERY_SCHEMA: z.ZodType<ParsedQuery> = z.object({
  intent: z.enum(['members', 'articles', 'events', 'all'])
    .describe('What type of content the user is searching for'),
  cleanQuery: z.string()
    .describe('Semantic search phrase stripped of filter keywords (dates, locations, categories)'),
  filters: z.object({
    city: z.string().nullable().describe('City name if mentioned in the query, otherwise null'),
    country: z.string().nullable().describe('Country or region name if mentioned, otherwise null'),
    dateFrom: z.string().nullable().describe('Start date in YYYY-MM-DD format, otherwise null'),
    dateTo: z.string().nullable().describe('End date in YYYY-MM-DD format, otherwise null'),
    serviceCategory: z.string().nullable().describe('Professional service or topic area (e.g. "GST", "transfer pricing"), otherwise null'),
    isVirtual: z.boolean().nullable().describe('True for online/virtual/remote events, otherwise null'),
  }),
});

const SYSTEM_PROMPT = `You are a search query parser for Expertly — a platform for verified finance and legal professionals.

Parse natural language search queries and extract structured information.

Rules:
- intent = 'events' when the query is about events, webinars, conferences, or meetups
- intent = 'members' when looking for professionals, experts, consultants, lawyers, or accountants
- intent = 'articles' when looking for articles, posts, reading material, or information on a topic
- intent = 'all' when unclear or the query spans multiple types
- cleanQuery: remove ALL location/date/format/virtual filter words, keep only the topical semantic core (e.g. "GST lawyer", "transfer pricing expert", "corporate law conference"). If the query is entirely generic (e.g. "anyone", "someone", "people", "professionals", "find anyone"), set cleanQuery to "finance legal professional consultant" as a broad default.
- ALWAYS extract city names from phrases like "from [city]", "in [city]", "based in [city]", "located in [city]". Common cities: Delhi, New Delhi, Mumbai, Bangalore, London, New York, Singapore, Dubai, Sydney, etc.
- ALWAYS extract country names from phrases like "from [country]", "in [country]". Use the full name as written (e.g. "India", "US", "United Kingdom", "UAE").
- Convert date expressions to YYYY-MM-DD using the provided today's date. If the user mentions a specific day like "26 March", set BOTH dateFrom AND dateTo to that same date (single-day range). Assume the current or next upcoming year if no year is given.
- If the user says "online", "virtual", "remote", "attend online", "join online" → set isVirtual: true (events only)
- serviceCategory should be a professional domain (e.g. "GST", "transfer pricing", "US incorporation", "corporate law", "VAT", "M&A")
- Only populate filters that are explicitly mentioned in the query

Examples:
Query: "I want a GST lawyer from Delhi"
Output: { "intent": "members", "cleanQuery": "GST lawyer", "filters": { "city": "Delhi", "country": "India", "serviceCategory": "GST" } }

Query: "find me transfer pricing experts in Singapore"
Output: { "intent": "members", "cleanQuery": "transfer pricing expert", "filters": { "city": "Singapore", "country": "Singapore", "serviceCategory": "transfer pricing" } }

Query: "online events on 26 March about corporate tax"
Output: { "intent": "events", "cleanQuery": "corporate tax conference", "filters": { "dateFrom": "2026-03-26", "dateTo": "2026-03-26", "isVirtual": true, "serviceCategory": "corporate tax" } }

Query: "articles about US incorporation"
Output: { "intent": "articles", "cleanQuery": "US incorporation", "filters": { "country": "US", "serviceCategory": "US incorporation" } }

Query: "lawyers in London"
Output: { "intent": "members", "cleanQuery": "lawyer", "filters": { "city": "London", "country": "United Kingdom" } }`;

@Injectable()
export class AiQueryParserService {
  private readonly logger = new Logger(AiQueryParserService.name);
  private model: LanguageModel | null = null;

  constructor(private readonly config: ConfigService) {
    this.model = this.buildModel();
  }

  private buildModel(): LanguageModel | null {
    const provider = this.config.get<string>('AI_PROVIDER') ?? 'openrouter';
    const modelName = this.config.get<string>('AI_MODEL');

    try {
      switch (provider) {
        case 'openrouter': {
          const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
          if (!apiKey) {
            this.logger.warn('OPENROUTER_API_KEY not set — AI search will use keyword fallback');
            return null;
          }
          const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey,
            headers: {
              'HTTP-Referer': 'https://expertly.com',
              'X-Title': 'Expertly Search',
            },
          });
          return openrouter(modelName ?? 'anthropic/claude-3-haiku');
        }

        case 'openai': {
          const apiKey = this.config.get<string>('OPENAI_API_KEY');
          if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY not set for AI_PROVIDER=openai');
            return null;
          }
          const openai = createOpenAI({ apiKey });
          return openai(modelName ?? 'gpt-4o-mini');
        }

        case 'anthropic': {
          const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
          if (!apiKey) {
            this.logger.warn('ANTHROPIC_API_KEY not set for AI_PROVIDER=anthropic');
            return null;
          }
          const anthropic = createAnthropic({ apiKey });
          return anthropic(modelName ?? 'claude-haiku-4-5-20251001');
        }

        case 'google': {
          const apiKey =
            this.config.get<string>('GOOGLE_AI_API_KEY') ??
            this.config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
          if (!apiKey) {
            this.logger.warn('GOOGLE_AI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY not set for AI_PROVIDER=google');
            return null;
          }
          const google = createGoogleGenerativeAI({ apiKey });
          return google(modelName ?? 'gemini-2.0-flash');
        }

        default:
          this.logger.warn(`Unknown AI_PROVIDER "${provider}" — AI search disabled`);
          return null;
      }
    } catch (err) {
      this.logger.error('Failed to initialise AI model', err);
      return null;
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }

  async parse(query: string): Promise<ParsedQuery> {
    if (!this.model) {
      return { intent: 'all', cleanQuery: query, filters: applyLocationFallback(query, {}) };
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { object } = await (generateObject as any)({
        model: this.model,
        schema: PARSED_QUERY_SCHEMA,
        system: SYSTEM_PROMPT,
        prompt: `Today is ${today}.\n\nQuery: "${query}"`,
      }) as { object: ParsedQuery };

      this.logger.debug(`LLM parsed: ${JSON.stringify(object.filters)}`);

      // Belt-and-suspenders: if LLM missed the city/country, extract programmatically
      const filters = applyLocationFallback(query, object.filters);
      return { ...object, filters };
    } catch (err) {
      this.logger.error('Query parsing failed, using keyword fallback', err);
      return { intent: 'all', cleanQuery: query, filters: applyLocationFallback(query, {}) };
    }
  }
}

// ── Programmatic location fallback ───────────────────────────────────────────
// Runs after LLM parse. If the LLM missed a city or country that appears
// verbatim in the query, this catches it deterministically.

const CITY_MAP: Array<{ regex: RegExp; city: string; country: string }> = [
  { regex: /\b(new delhi|delhi)\b/i,    city: 'Delhi',         country: 'India' },
  { regex: /\bmumbai\b/i,               city: 'Mumbai',        country: 'India' },
  { regex: /\bbangalore\b/i,            city: 'Bangalore',     country: 'India' },
  { regex: /\bhyderabad\b/i,            city: 'Hyderabad',     country: 'India' },
  { regex: /\bchennai\b/i,              city: 'Chennai',       country: 'India' },
  { regex: /\bpune\b/i,                 city: 'Pune',          country: 'India' },
  { regex: /\bkochi\b/i,               city: 'Kochi',         country: 'India' },
  { regex: /\blondon\b/i,              city: 'London',        country: 'United Kingdom' },
  { regex: /\bmanchester\b/i,          city: 'Manchester',    country: 'United Kingdom' },
  { regex: /\bedinburgh\b/i,           city: 'Edinburgh',     country: 'United Kingdom' },
  { regex: /\bsingapore\b/i,           city: 'Singapore',     country: 'Singapore' },
  { regex: /\bdubai\b/i,               city: 'Dubai',         country: 'United Arab Emirates' },
  { regex: /\bkuwait city\b/i,         city: 'Kuwait City',   country: 'Kuwait' },
  { regex: /\bnairobi\b/i,             city: 'Nairobi',       country: 'Kenya' },
  { regex: /\blagos\b/i,               city: 'Lagos',         country: 'Nigeria' },
  { regex: /\babuja\b/i,               city: 'Abuja',         country: 'Nigeria' },
  { regex: /\baccra\b/i,               city: 'Accra',         country: 'Ghana' },
  { regex: /\bkumasi\b/i,              city: 'Kumasi',        country: 'Ghana' },
  { regex: /\bdakar\b/i,               city: 'Dakar',         country: 'Senegal' },
  { regex: /\bjohannesburg\b/i,        city: 'Johannesburg',  country: 'South Africa' },
  { regex: /\bparis\b/i,               city: 'Paris',         country: 'France' },
  { regex: /\blyon\b/i,                city: 'Lyon',          country: 'France' },
  { regex: /\bmadrid\b/i,              city: 'Madrid',        country: 'Spain' },
  { regex: /\bmilan\b/i,               city: 'Milan',         country: 'Italy' },
  { regex: /\bbr?ussels\b/i,           city: 'Brussels',      country: 'Belgium' },
  { regex: /\blisbon\b/i,              city: 'Lisbon',        country: 'Portugal' },
  { regex: /\bcopenhagen\b/i,          city: 'Copenhagen',    country: 'Denmark' },
  { regex: /\boslo\b/i,                city: 'Oslo',          country: 'Norway' },
  { regex: /\bdublin\b/i,              city: 'Dublin',        country: 'Ireland' },
  { regex: /\bcairo\b/i,               city: 'Cairo',         country: 'Egypt' },
  { regex: /\bbeirut\b/i,              city: 'Beirut',        country: 'Lebanon' },
  { regex: /\bkarachi\b/i,             city: 'Karachi',       country: 'Pakistan' },
  { regex: /\blahore\b/i,              city: 'Lahore',        country: 'Pakistan' },
  { regex: /\bbeijing\b/i,             city: 'Beijing',       country: 'China' },
  { regex: /\bshanghai\b/i,            city: 'Shanghai',      country: 'China' },
  { regex: /\bseoul\b/i,               city: 'Seoul',         country: 'South Korea' },
  { regex: /\btokyo\b/i,               city: 'Tokyo',         country: 'Japan' },
  { regex: /\bs[aã]o paulo\b/i,        city: 'São Paulo',     country: 'Brazil' },
  { regex: /\bsydney\b/i,              city: 'Sydney',        country: 'Australia' },
  { regex: /\bnew york\b/i,            city: 'New York',      country: 'United States' },
];

// Demonyms & common abbreviations not derivable from canonical names
const COUNTRY_DEMONYMS: Array<{ regex: RegExp; country: string }> = [
  { regex: /\b(us|usa)\b/i,              country: 'United States' },
  { regex: /\bamerican\b/i,              country: 'United States' },
  { regex: /\b(uk)\b/i,                  country: 'United Kingdom' },
  { regex: /\b(british|english)\b/i,     country: 'United Kingdom' },
  { regex: /\b(uae|emirates)\b/i,        country: 'United Arab Emirates' },
  { regex: /\bemirati\b/i,               country: 'United Arab Emirates' },
  { regex: /\bindian\b/i,                country: 'India' },
  { regex: /\bsingaporean\b/i,           country: 'Singapore' },
  { regex: /\baustralian\b/i,            country: 'Australia' },
  { regex: /\bgerman\b/i,                country: 'Germany' },
  { regex: /\bfrench\b/i,                country: 'France' },
  { regex: /\bnigerian\b/i,              country: 'Nigeria' },
  { regex: /\bkenyan\b/i,                country: 'Kenya' },
  { regex: /\bsouth african\b/i,         country: 'South Africa' },
  { regex: /\bpakistani\b/i,             country: 'Pakistan' },
  { regex: /\bchinese\b/i,               country: 'China' },
  { regex: /\bjapanese\b/i,              country: 'Japan' },
  { regex: /\bbrazilian\b/i,             country: 'Brazil' },
];

// Canonical country names from shared constant + demonym/alias patterns
const COUNTRY_MAP: Array<{ regex: RegExp; country: string }> = [
  ...COUNTRY_DEMONYMS,
  ...COUNTRY_NAMES.map(name => ({
    regex: new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
    country: name,
  })),
];

function applyLocationFallback(query: string, filters: ParsedQuery['filters']): ParsedQuery['filters'] {
  const result = { ...filters };

  // City — only fill in if LLM missed it
  if (!result.city) {
    for (const entry of CITY_MAP) {
      if (entry.regex.test(query)) {
        result.city = entry.city;
        // Also fill country if not set
        if (!result.country) result.country = entry.country;
        break;
      }
    }
  }

  // Country — only fill in if still missing
  if (!result.country) {
    for (const entry of COUNTRY_MAP) {
      if (entry.regex.test(query)) {
        result.country = entry.country;
        break;
      }
    }
  }

  return result;
}
