// ── Single source of truth for all supported countries ────────────────────────
// Every country dropdown, DB enum, filter, and AI search derives from this list.

export interface CountryDef {
  /** Canonical name stored in DB (enum value) */
  name: string;
  /** ISO 3166-1 alpha-2 */
  code: string;
  /** Region grouping for onboarding form */
  region: string;
  /** International dialing code */
  phoneCode: string;
}

// ── Regions ──────────────────────────────────────────────────────────────────

export const REGIONS = [
  { value: 'africa', label: 'Africa' },
  { value: 'asia_pacific', label: 'Asia-Pacific' },
  { value: 'central_asia', label: 'Central Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'latin_america', label: 'Latin America & Caribbean' },
  { value: 'middle_east', label: 'Middle East' },
  { value: 'north_america', label: 'North America' },
  { value: 'south_asia', label: 'South Asia' },
] as const;

export type RegionValue = (typeof REGIONS)[number]['value'];

// ── Master country list ──────────────────────────────────────────────────────

export const COUNTRIES: readonly CountryDef[] = [
  // ── Africa ──
  { name: 'Algeria', code: 'DZ', region: 'africa', phoneCode: '+213' },
  { name: 'Angola', code: 'AO', region: 'africa', phoneCode: '+244' },
  { name: 'Botswana', code: 'BW', region: 'africa', phoneCode: '+267' },
  { name: 'Cameroon', code: 'CM', region: 'africa', phoneCode: '+237' },
  { name: "Côte d'Ivoire", code: 'CI', region: 'africa', phoneCode: '+225' },
  { name: 'Egypt', code: 'EG', region: 'africa', phoneCode: '+20' },
  { name: 'Ethiopia', code: 'ET', region: 'africa', phoneCode: '+251' },
  { name: 'Ghana', code: 'GH', region: 'africa', phoneCode: '+233' },
  { name: 'Kenya', code: 'KE', region: 'africa', phoneCode: '+254' },
  { name: 'Libya', code: 'LY', region: 'africa', phoneCode: '+218' },
  { name: 'Madagascar', code: 'MG', region: 'africa', phoneCode: '+261' },
  { name: 'Mauritius', code: 'MU', region: 'africa', phoneCode: '+230' },
  { name: 'Morocco', code: 'MA', region: 'africa', phoneCode: '+212' },
  { name: 'Mozambique', code: 'MZ', region: 'africa', phoneCode: '+258' },
  { name: 'Namibia', code: 'NA', region: 'africa', phoneCode: '+264' },
  { name: 'Nigeria', code: 'NG', region: 'africa', phoneCode: '+234' },
  { name: 'Rwanda', code: 'RW', region: 'africa', phoneCode: '+250' },
  { name: 'Senegal', code: 'SN', region: 'africa', phoneCode: '+221' },
  { name: 'South Africa', code: 'ZA', region: 'africa', phoneCode: '+27' },
  { name: 'Tanzania', code: 'TZ', region: 'africa', phoneCode: '+255' },
  { name: 'Tunisia', code: 'TN', region: 'africa', phoneCode: '+216' },
  { name: 'Uganda', code: 'UG', region: 'africa', phoneCode: '+256' },
  { name: 'Zambia', code: 'ZM', region: 'africa', phoneCode: '+260' },
  { name: 'Zimbabwe', code: 'ZW', region: 'africa', phoneCode: '+263' },

  // ── Asia-Pacific ──
  { name: 'Australia', code: 'AU', region: 'asia_pacific', phoneCode: '+61' },
  { name: 'Brunei', code: 'BN', region: 'asia_pacific', phoneCode: '+673' },
  { name: 'Cambodia', code: 'KH', region: 'asia_pacific', phoneCode: '+855' },
  { name: 'China', code: 'CN', region: 'asia_pacific', phoneCode: '+86' },
  { name: 'Fiji', code: 'FJ', region: 'asia_pacific', phoneCode: '+679' },
  { name: 'Hong Kong', code: 'HK', region: 'asia_pacific', phoneCode: '+852' },
  { name: 'Indonesia', code: 'ID', region: 'asia_pacific', phoneCode: '+62' },
  { name: 'Japan', code: 'JP', region: 'asia_pacific', phoneCode: '+81' },
  { name: 'Malaysia', code: 'MY', region: 'asia_pacific', phoneCode: '+60' },
  { name: 'Mongolia', code: 'MN', region: 'asia_pacific', phoneCode: '+976' },
  { name: 'Myanmar', code: 'MM', region: 'asia_pacific', phoneCode: '+95' },
  { name: 'New Zealand', code: 'NZ', region: 'asia_pacific', phoneCode: '+64' },
  { name: 'Philippines', code: 'PH', region: 'asia_pacific', phoneCode: '+63' },
  { name: 'Singapore', code: 'SG', region: 'asia_pacific', phoneCode: '+65' },
  { name: 'South Korea', code: 'KR', region: 'asia_pacific', phoneCode: '+82' },
  { name: 'Taiwan', code: 'TW', region: 'asia_pacific', phoneCode: '+886' },
  { name: 'Thailand', code: 'TH', region: 'asia_pacific', phoneCode: '+66' },
  { name: 'Vietnam', code: 'VN', region: 'asia_pacific', phoneCode: '+84' },

  // ── Central Asia ──
  { name: 'Armenia', code: 'AM', region: 'central_asia', phoneCode: '+374' },
  { name: 'Azerbaijan', code: 'AZ', region: 'central_asia', phoneCode: '+994' },
  { name: 'Georgia', code: 'GE', region: 'central_asia', phoneCode: '+995' },
  { name: 'Kazakhstan', code: 'KZ', region: 'central_asia', phoneCode: '+7' },
  { name: 'Kyrgyzstan', code: 'KG', region: 'central_asia', phoneCode: '+996' },
  { name: 'Tajikistan', code: 'TJ', region: 'central_asia', phoneCode: '+992' },
  { name: 'Turkmenistan', code: 'TM', region: 'central_asia', phoneCode: '+993' },
  { name: 'Uzbekistan', code: 'UZ', region: 'central_asia', phoneCode: '+998' },

  // ── Europe ──
  { name: 'Albania', code: 'AL', region: 'europe', phoneCode: '+355' },
  { name: 'Austria', code: 'AT', region: 'europe', phoneCode: '+43' },
  { name: 'Belgium', code: 'BE', region: 'europe', phoneCode: '+32' },
  { name: 'Bosnia and Herzegovina', code: 'BA', region: 'europe', phoneCode: '+387' },
  { name: 'Bulgaria', code: 'BG', region: 'europe', phoneCode: '+359' },
  { name: 'Croatia', code: 'HR', region: 'europe', phoneCode: '+385' },
  { name: 'Cyprus', code: 'CY', region: 'europe', phoneCode: '+357' },
  { name: 'Czech Republic', code: 'CZ', region: 'europe', phoneCode: '+420' },
  { name: 'Denmark', code: 'DK', region: 'europe', phoneCode: '+45' },
  { name: 'Estonia', code: 'EE', region: 'europe', phoneCode: '+372' },
  { name: 'Finland', code: 'FI', region: 'europe', phoneCode: '+358' },
  { name: 'France', code: 'FR', region: 'europe', phoneCode: '+33' },
  { name: 'Germany', code: 'DE', region: 'europe', phoneCode: '+49' },
  { name: 'Greece', code: 'GR', region: 'europe', phoneCode: '+30' },
  { name: 'Hungary', code: 'HU', region: 'europe', phoneCode: '+36' },
  { name: 'Iceland', code: 'IS', region: 'europe', phoneCode: '+354' },
  { name: 'Ireland', code: 'IE', region: 'europe', phoneCode: '+353' },
  { name: 'Italy', code: 'IT', region: 'europe', phoneCode: '+39' },
  { name: 'Latvia', code: 'LV', region: 'europe', phoneCode: '+371' },
  { name: 'Lithuania', code: 'LT', region: 'europe', phoneCode: '+370' },
  { name: 'Luxembourg', code: 'LU', region: 'europe', phoneCode: '+352' },
  { name: 'Malta', code: 'MT', region: 'europe', phoneCode: '+356' },
  { name: 'Moldova', code: 'MD', region: 'europe', phoneCode: '+373' },
  { name: 'Montenegro', code: 'ME', region: 'europe', phoneCode: '+382' },
  { name: 'Netherlands', code: 'NL', region: 'europe', phoneCode: '+31' },
  { name: 'North Macedonia', code: 'MK', region: 'europe', phoneCode: '+389' },
  { name: 'Norway', code: 'NO', region: 'europe', phoneCode: '+47' },
  { name: 'Poland', code: 'PL', region: 'europe', phoneCode: '+48' },
  { name: 'Portugal', code: 'PT', region: 'europe', phoneCode: '+351' },
  { name: 'Romania', code: 'RO', region: 'europe', phoneCode: '+40' },
  { name: 'Russia', code: 'RU', region: 'europe', phoneCode: '+7' },
  { name: 'Serbia', code: 'RS', region: 'europe', phoneCode: '+381' },
  { name: 'Slovakia', code: 'SK', region: 'europe', phoneCode: '+421' },
  { name: 'Slovenia', code: 'SI', region: 'europe', phoneCode: '+386' },
  { name: 'Spain', code: 'ES', region: 'europe', phoneCode: '+34' },
  { name: 'Sweden', code: 'SE', region: 'europe', phoneCode: '+46' },
  { name: 'Switzerland', code: 'CH', region: 'europe', phoneCode: '+41' },
  { name: 'Turkey', code: 'TR', region: 'europe', phoneCode: '+90' },
  { name: 'Ukraine', code: 'UA', region: 'europe', phoneCode: '+380' },
  { name: 'United Kingdom', code: 'GB', region: 'europe', phoneCode: '+44' },

  // ── Latin America & Caribbean ──
  { name: 'Argentina', code: 'AR', region: 'latin_america', phoneCode: '+54' },
  { name: 'Bolivia', code: 'BO', region: 'latin_america', phoneCode: '+591' },
  { name: 'Brazil', code: 'BR', region: 'latin_america', phoneCode: '+55' },
  { name: 'Chile', code: 'CL', region: 'latin_america', phoneCode: '+56' },
  { name: 'Colombia', code: 'CO', region: 'latin_america', phoneCode: '+57' },
  { name: 'Costa Rica', code: 'CR', region: 'latin_america', phoneCode: '+506' },
  { name: 'Dominican Republic', code: 'DO', region: 'latin_america', phoneCode: '+1' },
  { name: 'Ecuador', code: 'EC', region: 'latin_america', phoneCode: '+593' },
  { name: 'Guatemala', code: 'GT', region: 'latin_america', phoneCode: '+502' },
  { name: 'Jamaica', code: 'JM', region: 'latin_america', phoneCode: '+1' },
  { name: 'Mexico', code: 'MX', region: 'latin_america', phoneCode: '+52' },
  { name: 'Panama', code: 'PA', region: 'latin_america', phoneCode: '+507' },
  { name: 'Paraguay', code: 'PY', region: 'latin_america', phoneCode: '+595' },
  { name: 'Peru', code: 'PE', region: 'latin_america', phoneCode: '+51' },
  { name: 'Trinidad and Tobago', code: 'TT', region: 'latin_america', phoneCode: '+1' },
  { name: 'Uruguay', code: 'UY', region: 'latin_america', phoneCode: '+598' },
  { name: 'Venezuela', code: 'VE', region: 'latin_america', phoneCode: '+58' },

  // ── Middle East ──
  { name: 'Bahrain', code: 'BH', region: 'middle_east', phoneCode: '+973' },
  { name: 'Iran', code: 'IR', region: 'middle_east', phoneCode: '+98' },
  { name: 'Iraq', code: 'IQ', region: 'middle_east', phoneCode: '+964' },
  { name: 'Israel', code: 'IL', region: 'middle_east', phoneCode: '+972' },
  { name: 'Jordan', code: 'JO', region: 'middle_east', phoneCode: '+962' },
  { name: 'Kuwait', code: 'KW', region: 'middle_east', phoneCode: '+965' },
  { name: 'Lebanon', code: 'LB', region: 'middle_east', phoneCode: '+961' },
  { name: 'Oman', code: 'OM', region: 'middle_east', phoneCode: '+968' },
  { name: 'Qatar', code: 'QA', region: 'middle_east', phoneCode: '+974' },
  { name: 'Saudi Arabia', code: 'SA', region: 'middle_east', phoneCode: '+966' },
  { name: 'United Arab Emirates', code: 'AE', region: 'middle_east', phoneCode: '+971' },

  // ── North America ──
  { name: 'Canada', code: 'CA', region: 'north_america', phoneCode: '+1' },
  { name: 'United States', code: 'US', region: 'north_america', phoneCode: '+1' },

  // ── South Asia ──
  { name: 'Afghanistan', code: 'AF', region: 'south_asia', phoneCode: '+93' },
  { name: 'Bangladesh', code: 'BD', region: 'south_asia', phoneCode: '+880' },
  { name: 'India', code: 'IN', region: 'south_asia', phoneCode: '+91' },
  { name: 'Maldives', code: 'MV', region: 'south_asia', phoneCode: '+960' },
  { name: 'Nepal', code: 'NP', region: 'south_asia', phoneCode: '+977' },
  { name: 'Pakistan', code: 'PK', region: 'south_asia', phoneCode: '+92' },
  { name: 'Sri Lanka', code: 'LK', region: 'south_asia', phoneCode: '+94' },
] as const;

// ── Derived lookups (computed once at import time) ───────────────────────────

/** All country names, alphabetically sorted */
export const COUNTRY_NAMES: readonly string[] =
  [...COUNTRIES].map((c) => c.name).sort();

/** Set of valid country names for O(1) validation */
export const COUNTRY_NAME_SET: ReadonlySet<string> =
  new Set(COUNTRIES.map((c) => c.name));

/** Country name → ISO code */
export const NAME_TO_CODE: Readonly<Record<string, string>> =
  Object.fromEntries(COUNTRIES.map((c) => [c.name, c.code]));

/** ISO code → Country name */
export const CODE_TO_NAME: Readonly<Record<string, string>> =
  Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));

/** Countries grouped by region */
export const COUNTRIES_BY_REGION: Readonly<Record<string, readonly CountryDef[]>> =
  COUNTRIES.reduce<Record<string, CountryDef[]>>((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});

/** Country name → region value */
export const COUNTRY_TO_REGION: Readonly<Record<string, string>> =
  Object.fromEntries(COUNTRIES.map((c) => [c.name, c.region]));

/** Phone codes with labels, sorted by code */
export const PHONE_CODES: readonly { code: string; label: string }[] =
  [...new Map(
    COUNTRIES.map((c) => [
      c.phoneCode,
      { code: c.phoneCode, label: `${c.phoneCode} (${c.code})` },
    ]),
  ).values()].sort((a, b) => {
    const numA = parseInt(a.code.replace('+', ''), 10);
    const numB = parseInt(b.code.replace('+', ''), 10);
    return numA - numB;
  });

// ── Alias resolution ─────────────────────────────────────────────────────────
// Maps common abbreviations and alternate names → canonical country name.

const COUNTRY_ALIASES: Record<string, string> = {
  uk: 'United Kingdom',
  'u.k.': 'United Kingdom',
  britain: 'United Kingdom',
  'great britain': 'United Kingdom',
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  us: 'United States',
  'u.s.': 'United States',
  usa: 'United States',
  'u.s.a.': 'United States',
  america: 'United States',
  'united states of america': 'United States',
  uae: 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  emirates: 'United Arab Emirates',
  ksa: 'Saudi Arabia',
  korea: 'South Korea',
  'republic of korea': 'South Korea',
  holland: 'Netherlands',
  czechia: 'Czech Republic',
  'ivory coast': "Côte d'Ivoire",
};

// Also add lowercase canonical names → canonical names for normalization
for (const c of COUNTRIES) {
  const lower = c.name.toLowerCase();
  if (!COUNTRY_ALIASES[lower]) {
    COUNTRY_ALIASES[lower] = c.name;
  }
}

/**
 * Resolve a country name or alias to the canonical name.
 * Returns null if unrecognised.
 */
export function resolveCountryName(input: string): string | null {
  const trimmed = input.trim();
  // Exact match first
  if (COUNTRY_NAME_SET.has(trimmed)) return trimmed;
  // Alias / case-insensitive match
  return COUNTRY_ALIASES[trimmed.toLowerCase()] ?? null;
}

/**
 * Resolve a country name or alias to its ISO code.
 * Returns null if unrecognised.
 */
export function resolveCountryCode(input: string): string | null {
  const name = resolveCountryName(input);
  return name ? (NAME_TO_CODE[name] ?? null) : null;
}
