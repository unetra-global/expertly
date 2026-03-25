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

-- Step 3: Convert empty strings to NULL (members has NOT NULL DEFAULT '')
UPDATE members SET country = NULL WHERE trim(country) = '';

-- Step 4: Alter columns to use the enum
ALTER TABLE members
  ALTER COLUMN country DROP NOT NULL,
  ALTER COLUMN country DROP DEFAULT,
  ALTER COLUMN country TYPE country_enum USING country::country_enum;

ALTER TABLE applications
  ALTER COLUMN country TYPE country_enum USING country::country_enum;

ALTER TABLE events
  ALTER COLUMN country TYPE country_enum USING country::country_enum;
