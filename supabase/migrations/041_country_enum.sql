-- Create country_enum type and convert country TEXT columns to use it.
-- Canonical names match @expertly/utils COUNTRIES list.

-- Step 1: Normalize existing data before enum conversion
-- Map common abbreviations to canonical names
UPDATE members SET country = 'United Kingdom'        WHERE lower(trim(country)) IN ('uk', 'u.k.', 'britain', 'great britain', 'england');
UPDATE members SET country = 'United States'         WHERE lower(trim(country)) IN ('us', 'u.s.', 'usa', 'u.s.a.', 'america', 'united states of america');
UPDATE members SET country = 'United Arab Emirates'  WHERE lower(trim(country)) IN ('uae', 'u.a.e.', 'emirates');
UPDATE members SET country = 'Saudi Arabia'          WHERE lower(trim(country)) IN ('ksa');
UPDATE members SET country = 'South Korea'           WHERE lower(trim(country)) IN ('korea', 'republic of korea');
UPDATE members SET country = 'Netherlands'           WHERE lower(trim(country)) IN ('holland');
UPDATE members SET country = 'Czech Republic'        WHERE lower(trim(country)) IN ('czechia');

UPDATE applications SET country = 'United Kingdom'        WHERE lower(trim(country)) IN ('uk', 'u.k.', 'britain', 'great britain', 'england');
UPDATE applications SET country = 'United States'         WHERE lower(trim(country)) IN ('us', 'u.s.', 'usa', 'u.s.a.', 'america', 'united states of america');
UPDATE applications SET country = 'United Arab Emirates'  WHERE lower(trim(country)) IN ('uae', 'u.a.e.', 'emirates');
UPDATE applications SET country = 'Saudi Arabia'          WHERE lower(trim(country)) IN ('ksa');
UPDATE applications SET country = 'South Korea'           WHERE lower(trim(country)) IN ('korea', 'republic of korea');
UPDATE applications SET country = 'Netherlands'           WHERE lower(trim(country)) IN ('holland');
UPDATE applications SET country = 'Czech Republic'        WHERE lower(trim(country)) IN ('czechia');

UPDATE events SET country = 'United Kingdom'        WHERE lower(trim(country)) IN ('uk', 'u.k.', 'britain', 'great britain', 'england');
UPDATE events SET country = 'United States'         WHERE lower(trim(country)) IN ('us', 'u.s.', 'usa', 'u.s.a.', 'america', 'united states of america');
UPDATE events SET country = 'United Arab Emirates'  WHERE lower(trim(country)) IN ('uae', 'u.a.e.', 'emirates');
UPDATE events SET country = 'Saudi Arabia'          WHERE lower(trim(country)) IN ('ksa');
UPDATE events SET country = 'South Korea'           WHERE lower(trim(country)) IN ('korea', 'republic of korea');
UPDATE events SET country = 'Netherlands'           WHERE lower(trim(country)) IN ('holland');
UPDATE events SET country = 'Czech Republic'        WHERE lower(trim(country)) IN ('czechia');

-- Step 1b: Normalize ISO 3166-1 alpha-2 codes to full country names
UPDATE members SET country = 'Afghanistan'          WHERE upper(trim(country)) = 'AF';
UPDATE members SET country = 'Australia'            WHERE upper(trim(country)) = 'AU';
UPDATE members SET country = 'Bangladesh'           WHERE upper(trim(country)) = 'BD';
UPDATE members SET country = 'Belgium'              WHERE upper(trim(country)) = 'BE';
UPDATE members SET country = 'Brazil'               WHERE upper(trim(country)) = 'BR';
UPDATE members SET country = 'Canada'               WHERE upper(trim(country)) = 'CA';
UPDATE members SET country = 'China'                WHERE upper(trim(country)) = 'CN';
UPDATE members SET country = 'Egypt'                WHERE upper(trim(country)) = 'EG';
UPDATE members SET country = 'France'               WHERE upper(trim(country)) = 'FR';
UPDATE members SET country = 'Germany'              WHERE upper(trim(country)) = 'DE';
UPDATE members SET country = 'Ghana'                WHERE upper(trim(country)) = 'GH';
UPDATE members SET country = 'Hong Kong'            WHERE upper(trim(country)) = 'HK';
UPDATE members SET country = 'India'                WHERE upper(trim(country)) = 'IN';
UPDATE members SET country = 'Indonesia'            WHERE upper(trim(country)) = 'ID';
UPDATE members SET country = 'Ireland'              WHERE upper(trim(country)) = 'IE';
UPDATE members SET country = 'Israel'               WHERE upper(trim(country)) = 'IL';
UPDATE members SET country = 'Italy'                WHERE upper(trim(country)) = 'IT';
UPDATE members SET country = 'Japan'                WHERE upper(trim(country)) = 'JP';
UPDATE members SET country = 'Kenya'                WHERE upper(trim(country)) = 'KE';
UPDATE members SET country = 'Malaysia'             WHERE upper(trim(country)) = 'MY';
UPDATE members SET country = 'Mexico'               WHERE upper(trim(country)) = 'MX';
UPDATE members SET country = 'Morocco'              WHERE upper(trim(country)) = 'MA';
UPDATE members SET country = 'Netherlands'          WHERE upper(trim(country)) = 'NL';
UPDATE members SET country = 'New Zealand'          WHERE upper(trim(country)) = 'NZ';
UPDATE members SET country = 'Nigeria'              WHERE upper(trim(country)) = 'NG';
UPDATE members SET country = 'Norway'               WHERE upper(trim(country)) = 'NO';
UPDATE members SET country = 'Pakistan'             WHERE upper(trim(country)) = 'PK';
UPDATE members SET country = 'Philippines'          WHERE upper(trim(country)) = 'PH';
UPDATE members SET country = 'Poland'               WHERE upper(trim(country)) = 'PL';
UPDATE members SET country = 'Portugal'             WHERE upper(trim(country)) = 'PT';
UPDATE members SET country = 'Russia'               WHERE upper(trim(country)) = 'RU';
UPDATE members SET country = 'Singapore'            WHERE upper(trim(country)) = 'SG';
UPDATE members SET country = 'South Africa'         WHERE upper(trim(country)) = 'ZA';
UPDATE members SET country = 'South Korea'          WHERE upper(trim(country)) = 'KR';
UPDATE members SET country = 'Spain'                WHERE upper(trim(country)) = 'ES';
UPDATE members SET country = 'Sri Lanka'            WHERE upper(trim(country)) = 'LK';
UPDATE members SET country = 'Sweden'               WHERE upper(trim(country)) = 'SE';
UPDATE members SET country = 'Switzerland'          WHERE upper(trim(country)) = 'CH';
UPDATE members SET country = 'Taiwan'               WHERE upper(trim(country)) = 'TW';
UPDATE members SET country = 'Thailand'             WHERE upper(trim(country)) = 'TH';
UPDATE members SET country = 'Turkey'               WHERE upper(trim(country)) = 'TR';
UPDATE members SET country = 'Vietnam'              WHERE upper(trim(country)) = 'VN';

-- Same ISO-2 normalizations for applications and events
UPDATE applications SET country = 'Ireland'   WHERE upper(trim(country)) = 'IE';
UPDATE applications SET country = 'India'     WHERE upper(trim(country)) = 'IN';
UPDATE applications SET country = 'Singapore' WHERE upper(trim(country)) = 'SG';
UPDATE events      SET country = 'Ireland'    WHERE upper(trim(country)) = 'IE';
UPDATE events      SET country = 'India'      WHERE upper(trim(country)) = 'IN';
UPDATE events      SET country = 'Singapore'  WHERE upper(trim(country)) = 'SG';

-- Step 2: Create the enum type
CREATE TYPE country_enum AS ENUM (
  -- Africa
  'Algeria', 'Angola', 'Botswana', 'Cameroon', 'Côte d''Ivoire',
  'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Libya',
  'Madagascar', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
  'Nigeria', 'Rwanda', 'Senegal', 'South Africa', 'Tanzania',
  'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
  -- Asia-Pacific
  'Australia', 'Brunei', 'Cambodia', 'China', 'Fiji',
  'Hong Kong', 'Indonesia', 'Japan', 'Malaysia', 'Mongolia',
  'Myanmar', 'New Zealand', 'Philippines', 'Singapore', 'South Korea',
  'Taiwan', 'Thailand', 'Vietnam',
  -- Central Asia
  'Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Kyrgyzstan',
  'Tajikistan', 'Turkmenistan', 'Uzbekistan',
  -- Europe
  'Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
  'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands',
  'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania',
  'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain',
  'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom',
  -- Latin America & Caribbean
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia',
  'Costa Rica', 'Dominican Republic', 'Ecuador', 'Guatemala', 'Jamaica',
  'Mexico', 'Panama', 'Paraguay', 'Peru', 'Trinidad and Tobago',
  'Uruguay', 'Venezuela',
  -- Middle East
  'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jordan',
  'Kuwait', 'Lebanon', 'Oman', 'Qatar', 'Saudi Arabia',
  'United Arab Emirates',
  -- North America
  'Canada', 'United States',
  -- South Asia
  'Afghanistan', 'Bangladesh', 'India', 'Maldives', 'Nepal',
  'Pakistan', 'Sri Lanka'
);

-- Step 3: Drop NOT NULL + DEFAULT on members first (required before we can set NULL values)
ALTER TABLE members
  ALTER COLUMN country DROP NOT NULL,
  ALTER COLUMN country DROP DEFAULT;

-- Step 4: Null out any remaining unrecognized or empty values before the cast.
-- Uses the pg_enum catalog now that country_enum exists (Step 2 above).
UPDATE members
  SET country = NULL
  WHERE country IS NULL
     OR trim(country) = ''
     OR country NOT IN (
       SELECT e.enumlabel FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid
       WHERE t.typname = 'country_enum'
     );

UPDATE applications
  SET country = NULL
  WHERE country IS NOT NULL
    AND country NOT IN (
      SELECT e.enumlabel FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'country_enum'
    );

UPDATE events
  SET country = NULL
  WHERE country IS NOT NULL
    AND country NOT IN (
      SELECT e.enumlabel FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'country_enum'
    );

-- Step 5: Alter columns to use the enum type
ALTER TABLE members
  ALTER COLUMN country TYPE country_enum USING country::country_enum;

ALTER TABLE applications
  ALTER COLUMN country TYPE country_enum USING country::country_enum;

ALTER TABLE events
  ALTER COLUMN country TYPE country_enum USING country::country_enum;
