-- ─── Expertly Seed Data v3 ────────────────────────────────────────────────────
-- Migration 023: Rich seed — 45 members · 55 articles · 36 events
-- Run AFTER migrations 001–022
-- Service IDs resolved via slug subqueries (auto-generated in 021)

BEGIN;

-- ─── Step 1: Insert 45 users ──────────────────────────────────────────────────

INSERT INTO public.users (id, supabase_uid, email, full_name, first_name, last_name, role) VALUES
-- Direct Tax (1–8)
('d0230001-0000-0000-0000-000000000000','b0230001-0000-0000-0000-000000000000','oliver.bennett@expertly.dev','Oliver Bennett','Oliver','Bennett','member'),
('d0230002-0000-0000-0000-000000000000','b0230002-0000-0000-0000-000000000000','mei.nakamura@expertly.dev','Mei Nakamura','Mei','Nakamura','member'),
('d0230003-0000-0000-0000-000000000000','b0230003-0000-0000-0000-000000000000','ananya.krishnan@expertly.dev','Ananya Krishnan','Ananya','Krishnan','member'),
('d0230004-0000-0000-0000-000000000000','b0230004-0000-0000-0000-000000000000','hassan.alfarsi@expertly.dev','Hassan Al-Farsi','Hassan','Al-Farsi','member'),
('d0230005-0000-0000-0000-000000000000','b0230005-0000-0000-0000-000000000000','samuel.kofi@expertly.dev','Samuel Kofi','Samuel','Kofi','member'),
('d0230006-0000-0000-0000-000000000000','b0230006-0000-0000-0000-000000000000','elena.voronova@expertly.dev','Elena Voronova','Elena','Voronova','member'),
('d0230007-0000-0000-0000-000000000000','b0230007-0000-0000-0000-000000000000','david.park@expertly.dev','David Park','David','Park','member'),
('d0230008-0000-0000-0000-000000000000','b0230008-0000-0000-0000-000000000000','aditya.malhotra@expertly.dev','Aditya Malhotra','Aditya','Malhotra','member'),
-- Indirect Tax (9–14)
('d0230009-0000-0000-0000-000000000000','b0230009-0000-0000-0000-000000000000','priya.venkatesh@expertly.dev','Priya Venkatesh','Priya','Venkatesh','member'),
('d0230010-0000-0000-0000-000000000000','b0230010-0000-0000-0000-000000000000','rahul.kapoor@expertly.dev','Rahul Kapoor','Rahul','Kapoor','member'),
('d0230011-0000-0000-0000-000000000000','b0230011-0000-0000-0000-000000000000','fatima.almutairi@expertly.dev','Fatima Al-Mutairi','Fatima','Al-Mutairi','member'),
('d0230012-0000-0000-0000-000000000000','b0230012-0000-0000-0000-000000000000','tariq.mahmood@expertly.dev','Tariq Mahmood','Tariq','Mahmood','member'),
('d0230013-0000-0000-0000-000000000000','b0230013-0000-0000-0000-000000000000','emma.thompson@expertly.dev','Emma Thompson','Emma','Thompson','member'),
('d0230014-0000-0000-0000-000000000000','b0230014-0000-0000-0000-000000000000','pierre.dubois@expertly.dev','Pierre Dubois','Pierre','Dubois','member'),
-- Accounting (15–21)
('d0230015-0000-0000-0000-000000000000','b0230015-0000-0000-0000-000000000000','carlos.santos@expertly.dev','Carlos Santos','Carlos','Santos','member'),
('d0230016-0000-0000-0000-000000000000','b0230016-0000-0000-0000-000000000000','yuki.tanaka@expertly.dev','Yuki Tanaka','Yuki','Tanaka','member'),
('d0230017-0000-0000-0000-000000000000','b0230017-0000-0000-0000-000000000000','amara.diallo@expertly.dev','Amara Diallo','Amara','Diallo','member'),
('d0230018-0000-0000-0000-000000000000','b0230018-0000-0000-0000-000000000000','grace.kim@expertly.dev','Grace Kim','Grace','Kim','member'),
('d0230019-0000-0000-0000-000000000000','b0230019-0000-0000-0000-000000000000','simon.debeer@expertly.dev','Simon De Beer','Simon','De Beer','member'),
('d0230020-0000-0000-0000-000000000000','b0230020-0000-0000-0000-000000000000','nadia.hassan@expertly.dev','Nadia Hassan','Nadia','Hassan','member'),
('d0230021-0000-0000-0000-000000000000','b0230021-0000-0000-0000-000000000000','patrick.oreilly@expertly.dev','Patrick O''Reilly','Patrick','O''Reilly','member'),
-- Audit & Assurance (22–27)
('d0230022-0000-0000-0000-000000000000','b0230022-0000-0000-0000-000000000000','andrew.fitzgerald@expertly.dev','Andrew Fitzgerald','Andrew','Fitzgerald','member'),
('d0230023-0000-0000-0000-000000000000','b0230023-0000-0000-0000-000000000000','olumide.adeleke@expertly.dev','Olumide Adeleke','Olumide','Adeleke','member'),
('d0230024-0000-0000-0000-000000000000','b0230024-0000-0000-0000-000000000000','ingeborg.larsen@expertly.dev','Ingeborg Larsen','Ingeborg','Larsen','member'),
('d0230025-0000-0000-0000-000000000000','b0230025-0000-0000-0000-000000000000','li.wei@expertly.dev','Li Wei','Li','Wei','member'),
('d0230026-0000-0000-0000-000000000000','b0230026-0000-0000-0000-000000000000','kavya.nair@expertly.dev','Kavya Nair','Kavya','Nair','member'),
('d0230027-0000-0000-0000-000000000000','b0230027-0000-0000-0000-000000000000','rami.alsayed@expertly.dev','Rami Al-Sayed','Rami','Al-Sayed','member'),
-- Corporate Law (28–36)
('d0230028-0000-0000-0000-000000000000','b0230028-0000-0000-0000-000000000000','marcus.adeyemi@expertly.dev','Marcus Adeyemi','Marcus','Adeyemi','member'),
('d0230029-0000-0000-0000-000000000000','b0230029-0000-0000-0000-000000000000','soojin.park@expertly.dev','Soo-Jin Park','Soo-Jin','Park','member'),
('d0230030-0000-0000-0000-000000000000','b0230030-0000-0000-0000-000000000000','rebecca.mcallister@expertly.dev','Rebecca McAllister','Rebecca','McAllister','member'),
('d0230031-0000-0000-0000-000000000000','b0230031-0000-0000-0000-000000000000','lorenzo.ferrari@expertly.dev','Lorenzo Ferrari','Lorenzo','Ferrari','member'),
('d0230032-0000-0000-0000-000000000000','b0230032-0000-0000-0000-000000000000','zara.ahmed@expertly.dev','Zara Ahmed','Zara','Ahmed','member'),
('d0230033-0000-0000-0000-000000000000','b0230033-0000-0000-0000-000000000000','hugo.leclerc@expertly.dev','Hugo Leclerc','Hugo','Leclerc','member'),
('d0230034-0000-0000-0000-000000000000','b0230034-0000-0000-0000-000000000000','chen.wei@expertly.dev','Chen Wei','Chen','Wei','member'),
('d0230035-0000-0000-0000-000000000000','b0230035-0000-0000-0000-000000000000','priyanka.sinha@expertly.dev','Priyanka Sinha','Priyanka','Sinha','member'),
('d0230036-0000-0000-0000-000000000000','b0230036-0000-0000-0000-000000000000','tariq.osman@expertly.dev','Tariq Osman','Tariq','Osman','member'),
-- Legal Services (37–45)
('d0230037-0000-0000-0000-000000000000','b0230037-0000-0000-0000-000000000000','pilar.morales@expertly.dev','Pilar Morales','Pilar','Morales','member'),
('d0230038-0000-0000-0000-000000000000','b0230038-0000-0000-0000-000000000000','kwame.asante@expertly.dev','Kwame Asante','Kwame','Asante','member'),
('d0230039-0000-0000-0000-000000000000','b0230039-0000-0000-0000-000000000000','sophie.laurent@expertly.dev','Sophie Laurent','Sophie','Laurent','member'),
('d0230040-0000-0000-0000-000000000000','b0230040-0000-0000-0000-000000000000','michael.osei@expertly.dev','Michael Osei','Michael','Osei','member'),
('d0230041-0000-0000-0000-000000000000','b0230041-0000-0000-0000-000000000000','fatima.malik@expertly.dev','Fatima Malik','Fatima','Malik','member'),
('d0230042-0000-0000-0000-000000000000','b0230042-0000-0000-0000-000000000000','james.kiplangat@expertly.dev','James Kiplangat','James','Kiplangat','member'),
('d0230043-0000-0000-0000-000000000000','b0230043-0000-0000-0000-000000000000','ana.sousa@expertly.dev','Ana Sousa','Ana','Sousa','member'),
('d0230044-0000-0000-0000-000000000000','b0230044-0000-0000-0000-000000000000','viktor.andersen@expertly.dev','Viktor Andersen','Viktor','Andersen','member'),
('d0230045-0000-0000-0000-000000000000','b0230045-0000-0000-0000-000000000000','preethi.rajan@expertly.dev','Preethi Rajan','Preethi','Rajan','member');

-- ─── Step 2: Insert 45 members ───────────────────────────────────────────────

INSERT INTO members (
  id, user_id, slug, designation, headline, bio,
  city, country, member_tier,
  is_verified, verified_at, is_featured,
  primary_service_id,
  years_of_experience, consultation_fee_min_usd, consultation_fee_max_usd,
  membership_status, membership_start_date, membership_expiry_date,
  linkedin_url, website,
  work_experience, education, credentials
) VALUES

-- 1. Oliver Bennett — Corporate Tax, UK (seasoned, verified, featured)
(
  'e0230001-0000-0000-0000-000000000000',
  'd0230001-0000-0000-0000-000000000000',
  'oliver-bennett',
  'Head of Corporate Tax, UK & Europe',
  'Advising FTSE 100 companies and private equity on UK and cross-border corporate tax strategy, restructuring, and M&A tax.',
  'Oliver Bennett is a UK corporate tax specialist with 20 years at the Big Four and senior in-house. He has led the tax structuring of some of the UK''s most complex private equity transactions and has deep expertise in HMRC enquiries, group restructurings, and R&D incentives. He now advises boards and CFOs directly as an independent tax counsel.',
  'London', 'GB', 'seasoned_professional',
  true, NOW() - INTERVAL '90 days', true,
  (SELECT id FROM services WHERE slug = 'corporate-tax' LIMIT 1),
  20, 600, 1800,
  'active', CURRENT_DATE - INTERVAL '200 days', CURRENT_DATE + INTERVAL '165 days',
  'https://linkedin.com/in/oliver-bennett-tax',
  'https://bennettcorporatetax.co.uk',
  '[{"company":"PwC UK","title":"Partner — Corporate Tax","from":"2015","to":"2023","description":"Led the corporate tax practice for PE-backed transactions"},{"company":"KPMG UK","title":"Director","from":"2008","to":"2015","description":"M&A tax and group restructuring"}]',
  '[{"institution":"University of Cambridge","degree":"LLM (Taxation)","year":"2004"},{"institution":"University of Bristol","degree":"LLB","year":"2003"}]',
  '[{"name":"Chartered Tax Adviser","issuer":"CIOT","year":"2006"},{"name":"Associate of the Chartered Institute of Taxation","issuer":"CIOT","year":"2005"}]'
),

-- 2. Mei Nakamura — Transfer Pricing, Japan (seasoned, verified)
(
  'e0230002-0000-0000-0000-000000000000',
  'd0230002-0000-0000-0000-000000000000',
  'mei-nakamura',
  'Transfer Pricing Director',
  'Expert in Japanese and Asia-Pacific transfer pricing compliance, APAs, and intercompany pricing strategies for multinationals.',
  'Mei Nakamura has 15 years of transfer pricing experience across Deloitte Japan and in-house roles at major Japanese electronics and automotive groups. She specialises in advance pricing agreements, country-by-country reporting, and the Japanese NTA''s audit approach. She advises foreign companies expanding into Japan on setting up compliant intercompany structures.',
  'Tokyo', 'JP', 'seasoned_professional',
  true, NOW() - INTERVAL '75 days', false,
  (SELECT id FROM services WHERE slug = 'transfer-pricing' LIMIT 1),
  15, 300, 900,
  'active', CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE + INTERVAL '215 days',
  'https://linkedin.com/in/mei-nakamura-tp',
  NULL,
  '[{"company":"Deloitte Japan","title":"Director — Transfer Pricing","from":"2016","to":"2024","description":"Led TP documentation and APA negotiations for 30+ MNCs"},{"company":"Toyota Motor Corporation","title":"Senior Tax Manager","from":"2010","to":"2016","description":"Global TP policy and intercompany pricing management"}]',
  '[{"institution":"Waseda University","degree":"LLM International Tax","year":"2008"},{"institution":"Keio University","degree":"BCom Economics","year":"2006"}]',
  '[{"name":"Certified Public Tax Accountant","issuer":"JCTAA","year":"2009"},{"name":"CFA Charterholder","issuer":"CFA Institute","year":"2013"}]'
),

-- 3. Ananya Krishnan — International Tax, India (seasoned, verified)
(
  'e0230003-0000-0000-0000-000000000000',
  'd0230003-0000-0000-0000-000000000000',
  'ananya-krishnan',
  'Partner — International Tax & Treaties',
  'India-focused international tax expert helping multinationals structure cross-border investments and navigate India-specific treaty positions.',
  'Ananya Krishnan is a Chartered Accountant with 16 years specialising in Indian and international tax. She has advised on the tax implications of over 80 FDI transactions into India, worked extensively on India''s tax treaty network, and represented clients before the Authority for Advance Rulings. She is a frequent speaker at the International Fiscal Association.',
  'Bangalore', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '60 days', false,
  (SELECT id FROM services WHERE slug = 'international-tax' LIMIT 1),
  16, 150, 500,
  'active', CURRENT_DATE - INTERVAL '130 days', CURRENT_DATE + INTERVAL '235 days',
  'https://linkedin.com/in/ananya-krishnan-tax',
  'https://krishnanintltax.in',
  '[{"company":"Krishnan & Associates","title":"Partner","from":"2019","to":"present","description":"International tax boutique advising MNCs on India entry and exit"},{"company":"EY India","title":"Senior Manager","from":"2012","to":"2019","description":"International tax and treaty advisory"}]',
  '[{"institution":"NALSAR University of Law","degree":"LLM Taxation","year":"2008"},{"institution":"University of Mumbai","degree":"BCom","year":"2007"}]',
  '[{"name":"Chartered Accountant","issuer":"ICAI","year":"2009"},{"name":"IFA India Chapter Member","issuer":"IFA","year":"2012"}]'
),

-- 4. Hassan Al-Farsi — International Tax, UAE (seasoned, verified)
(
  'e0230004-0000-0000-0000-000000000000',
  'd0230004-0000-0000-0000-000000000000',
  'hassan-al-farsi',
  'Director — UAE & GCC Tax Advisory',
  'Helping businesses navigate the UAE''s evolving corporate tax regime and the GCC VAT framework, with a focus on free zone structures.',
  'Hassan Al-Farsi is a leading UAE tax advisor with 13 years of experience in GCC tax matters, including UAE Corporate Tax (effective 2023), VAT, and international structuring. He advises sovereign wealth funds, family offices, and multinationals on setting up compliant and tax-efficient structures in the UAE and broader GCC. Previously Head of Tax at a UAE national bank.',
  'Dubai', 'AE', 'seasoned_professional',
  true, NOW() - INTERVAL '50 days', false,
  (SELECT id FROM services WHERE slug = 'international-tax' LIMIT 1),
  13, 350, 1000,
  'active', CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days',
  'https://linkedin.com/in/hassan-alfarsi-tax',
  'https://alfarsi-tax.ae',
  '[{"company":"Al-Farsi Tax & Advisory","title":"Founder & Director","from":"2020","to":"present","description":"UAE and GCC tax advisory boutique"},{"company":"Emirates NBD","title":"Head of Tax","from":"2015","to":"2020","description":"Group tax strategy, UAE VAT implementation, and international structuring"}]',
  '[{"institution":"American University of Sharjah","degree":"MBA Finance","year":"2010"},{"institution":"UAE University","degree":"BBA Accounting","year":"2008"}]',
  '[{"name":"UAE Tax Agent","issuer":"FTA UAE","year":"2018"},{"name":"Chartered Tax Adviser","issuer":"CIOT","year":"2016"}]'
),

-- 5. Samuel Kofi — M&A Tax, Ghana (seasoned)
(
  'e0230005-0000-0000-0000-000000000000',
  'd0230005-0000-0000-0000-000000000000',
  'samuel-kofi',
  'M&A Tax Partner',
  'Advising on the tax dimensions of mergers, acquisitions, and restructurings across West Africa, with a focus on Ghana and Nigeria.',
  'Samuel Kofi is a Ghanaian tax professional with 12 years of experience in M&A tax, corporate restructuring, and cross-border transactions in West Africa. He has advised on the tax aspects of transactions in mining, oil & gas, telecoms, and financial services. Samuel leads the tax practice at a leading Accra law firm.',
  'Accra', 'GH', 'seasoned_professional',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'ma-tax' LIMIT 1),
  12, 100, 400,
  'active', CURRENT_DATE - INTERVAL '110 days', CURRENT_DATE + INTERVAL '255 days',
  'https://linkedin.com/in/samuel-kofi-tax',
  NULL,
  '[{"company":"Bentsi-Enchill, Letsa & Ankomah","title":"Tax Partner","from":"2018","to":"present","description":"M&A tax and corporate restructuring advisory in West Africa"},{"company":"Deloitte Ghana","title":"Senior Manager","from":"2012","to":"2018","description":"Corporate and M&A tax"}]',
  '[{"institution":"Ghana School of Law","degree":"BL","year":"2012"},{"institution":"University of Ghana","degree":"LLB","year":"2011"}]',
  '[{"name":"Chartered Tax Practitioner","issuer":"CIAT","year":"2014"}]'
),

-- 6. Elena Voronova — Tax Litigation, UAE/International (seasoned, verified)
(
  'e0230006-0000-0000-0000-000000000000',
  'd0230006-0000-0000-0000-000000000000',
  'elena-voronova',
  'Tax Dispute & Litigation Specialist',
  'Representing corporates and high-net-worth individuals in tax disputes before courts and regulatory bodies in the UK, UAE, and EU.',
  'Elena Voronova is a dual-qualified tax litigator with 14 years of experience representing clients in high-stakes tax disputes. Having trained in Moscow and London, she now advises international businesses and wealthy individuals on tax controversy strategy, voluntary disclosures, and penalty mitigation across multiple jurisdictions.',
  'Dubai', 'AE', 'seasoned_professional',
  true, NOW() - INTERVAL '45 days', false,
  (SELECT id FROM services WHERE slug = 'tax-litigation' LIMIT 1),
  14, 400, 1200,
  'active', CURRENT_DATE - INTERVAL '95 days', CURRENT_DATE + INTERVAL '270 days',
  'https://linkedin.com/in/elena-voronova-tax',
  NULL,
  '[{"company":"Voronova Tax Counsel","title":"Founder","from":"2021","to":"present","description":"Independent tax dispute practice serving international clients"},{"company":"Baker McKenzie","title":"Counsel — Tax Controversy","from":"2014","to":"2021","description":"Tax litigation and dispute resolution across EMEA"}]',
  '[{"institution":"London School of Economics","degree":"LLM Taxation","year":"2010"},{"institution":"Moscow State Law University","degree":"LLB","year":"2008"}]',
  '[{"name":"Barrister (non-practising)","issuer":"Bar of England and Wales","year":"2011"},{"name":"Solicitor of the Supreme Court","issuer":"SRA","year":"2013"}]'
),

-- 7. David Park — Tax Compliances, South Korea (budding)
(
  'e0230007-0000-0000-0000-000000000000',
  'd0230007-0000-0000-0000-000000000000',
  'david-park',
  'Corporate Tax Compliance Manager',
  'Helping Korean SMEs and foreign subsidiaries in Korea navigate corporate tax filings, deductions, and NTS compliance requirements.',
  'David Park is a South Korean tax professional with 6 years specialising in corporate tax compliance for mid-market companies and foreign-invested enterprises operating in Korea. He helps clients manage tax filing obligations, navigate NTS audits, and optimise allowable deductions under the Korean tax code.',
  'Seoul', 'KR', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'tax-compliances' LIMIT 1),
  6, 80, 250,
  'active', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days',
  'https://linkedin.com/in/david-park-tax-korea',
  NULL,
  '[{"company":"Park Tax Advisory","title":"Founder","from":"2022","to":"present","description":"Corporate tax compliance for Korean SMEs and foreign subsidiaries"},{"company":"Samil PwC Korea","title":"Tax Associate","from":"2018","to":"2022","description":"Corporate tax compliance and advisory"}]',
  '[{"institution":"Seoul National University","degree":"BA Economics","year":"2018"}]',
  '[{"name":"Certified Public Accountant","issuer":"KICPA","year":"2019"}]'
),

-- 8. Aditya Malhotra — Estate & Succession Planning, India (seasoned, verified)
(
  'e0230008-0000-0000-0000-000000000000',
  'd0230008-0000-0000-0000-000000000000',
  'aditya-malhotra',
  'Director — Wealth & Succession Planning',
  'Structuring estate plans and succession solutions for India''s business families and HNWIs to preserve and transfer wealth efficiently.',
  'Aditya Malhotra brings 17 years of experience in estate planning, family office advisory, and succession structuring for Indian business families and high-net-worth individuals. He has helped over 150 families create robust succession plans using family trusts, wills, and holding structures. He is a Chartered Accountant and qualified as a Trust & Estate Practitioner.',
  'Delhi', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '55 days', false,
  (SELECT id FROM services WHERE slug = 'estate-succession' LIMIT 1),
  17, 200, 700,
  'active', CURRENT_DATE - INTERVAL '140 days', CURRENT_DATE + INTERVAL '225 days',
  'https://linkedin.com/in/aditya-malhotra-wealth',
  'https://adityamalhotra.in',
  '[{"company":"Malhotra Wealth Advisors","title":"Founder & Director","from":"2018","to":"present","description":"Family wealth and succession advisory practice"},{"company":"DSP Family Office","title":"Vice President","from":"2013","to":"2018","description":"Estate planning and trust structuring for ultra-HNW clients"}]',
  '[{"institution":"National Law University Delhi","degree":"LLM Corporate Law","year":"2007"},{"institution":"University of Delhi","degree":"BCom (Hons)","year":"2005"}]',
  '[{"name":"Chartered Accountant","issuer":"ICAI","year":"2008"},{"name":"Trust & Estate Practitioner","issuer":"STEP","year":"2012"}]'
),

-- 9. Priya Venkatesh — GST Advisory, India (seasoned, verified)
(
  'e0230009-0000-0000-0000-000000000000',
  'd0230009-0000-0000-0000-000000000000',
  'priya-venkatesh',
  'GST & Indirect Tax Director',
  'End-to-end GST advisory for Indian businesses — from registration and input credit optimisation to audits and tribunal representation.',
  'Priya Venkatesh is one of India''s leading GST practitioners, with 14 years of indirect tax experience across advisory, litigation, and compliance. She has been at the forefront of India''s GST journey since its implementation in 2017, advising over 200 businesses on GST transition, compliance frameworks, and refund management. She represents clients before the GST Appellate Authority and High Courts.',
  'Hyderabad', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '80 days', false,
  (SELECT id FROM services WHERE slug = 'gst-advisory' LIMIT 1),
  14, 100, 400,
  'active', CURRENT_DATE - INTERVAL '160 days', CURRENT_DATE + INTERVAL '205 days',
  'https://linkedin.com/in/priya-venkatesh-gst',
  NULL,
  '[{"company":"Venkatesh GST & Tax","title":"Founder","from":"2017","to":"present","description":"Boutique GST advisory and litigation practice"},{"company":"Grant Thornton India","title":"Manager — Indirect Tax","from":"2012","to":"2017","description":"Indirect tax advisory and compliance"}]',
  '[{"institution":"Osmania University","degree":"LLB","year":"2009"},{"institution":"University of Hyderabad","degree":"BCom","year":"2007"}]',
  '[{"name":"Chartered Accountant","issuer":"ICAI","year":"2010"},{"name":"GST Practitioner","issuer":"GSTN","year":"2017"}]'
),

-- 10. Rahul Kapoor — GST Compliance, India (budding)
(
  'e0230010-0000-0000-0000-000000000000',
  'd0230010-0000-0000-0000-000000000000',
  'rahul-kapoor',
  'GST Compliance Specialist',
  'Helping Indian SMEs and e-commerce businesses manage monthly GST filings, input tax credit reconciliation, and annual returns.',
  'Rahul Kapoor is a GST compliance professional with 5 years of hands-on experience managing monthly and quarterly GST returns for a diverse portfolio of clients including e-commerce sellers, manufacturers, and service providers. He specialises in GSTR reconciliation, ITC optimisation, and resolving GST notices from the department.',
  'Pune', 'IN', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'gst-compliance' LIMIT 1),
  5, 50, 150,
  'active', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '320 days',
  'https://linkedin.com/in/rahul-kapoor-gst',
  NULL,
  '[{"company":"Kapoor Tax Services","title":"Founder","from":"2022","to":"present","description":"GST compliance for SMEs and e-commerce businesses"},{"company":"Edelweiss Financial Services","title":"Tax Analyst","from":"2019","to":"2022","description":"Indirect tax compliance and advisory"}]',
  '[{"institution":"Symbiosis College of Arts & Commerce","degree":"BCom","year":"2019"}]',
  '[{"name":"Chartered Accountant","issuer":"ICAI","year":"2020"}]'
),

-- 11. Fatima Al-Mutairi — VAT Advisory, Kuwait (seasoned, verified)
(
  'e0230011-0000-0000-0000-000000000000',
  'd0230011-0000-0000-0000-000000000000',
  'fatima-al-mutairi',
  'GCC VAT & Indirect Tax Advisor',
  'Supporting businesses across Kuwait, Saudi Arabia, and Bahrain with VAT registration, compliance, and refund optimisation.',
  'Fatima Al-Mutairi is a GCC indirect tax specialist with 11 years of experience, having advised corporates and government entities on VAT implementation across the Gulf since 2018. She is a VAT registration agent in Kuwait and Bahrain and has deep expertise in financial services VAT, cross-border supply rules, and the special schemes applicable to free zones.',
  'Kuwait City', 'KW', 'seasoned_professional',
  true, NOW() - INTERVAL '65 days', false,
  (SELECT id FROM services WHERE slug = 'vat-advisory' LIMIT 1),
  11, 200, 700,
  'active', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '245 days',
  'https://linkedin.com/in/fatima-almutairi-vat',
  NULL,
  '[{"company":"Al-Mutairi Tax Consulting","title":"Principal Advisor","from":"2019","to":"present","description":"GCC VAT advisory and compliance services"},{"company":"KPMG Kuwait","title":"Senior Manager — Indirect Tax","from":"2013","to":"2019","description":"VAT implementation and compliance for GCC clients"}]',
  '[{"institution":"Kuwait University","degree":"BSc Accounting & Finance","year":"2012"}]',
  '[{"name":"Certified Tax Consultant","issuer":"Kuwait Ministry of Finance","year":"2018"},{"name":"GCC VAT Specialist","issuer":"CIOT","year":"2019"}]'
),

-- 12. Tariq Mahmood — VAT Advisory, Pakistan (budding)
(
  'e0230012-0000-0000-0000-000000000000',
  'd0230012-0000-0000-0000-000000000000',
  'tariq-mahmood',
  'Sales Tax & Indirect Tax Consultant',
  'Advising Pakistani businesses on federal and provincial sales tax compliance, FBR audits, and cross-border transaction tax treatment.',
  'Tariq Mahmood is an emerging indirect tax specialist in Pakistan with 4 years of experience navigating Pakistan''s complex multi-tier sales tax regime spanning federal GST, provincial services taxes, and customs duties. He advises technology companies, importers, and service providers on compliance and FBR audit management.',
  'Karachi', 'PK', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'vat-advisory' LIMIT 1),
  4, 30, 100,
  'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days',
  'https://linkedin.com/in/tariq-mahmood-tax-pk',
  NULL,
  '[{"company":"Mahmood Tax Advisory","title":"Founder","from":"2023","to":"present","description":"Indirect tax compliance for Pakistani businesses"},{"company":"Yousuf Adil Chartered Accountants","title":"Tax Associate","from":"2020","to":"2023","description":"Sales tax and customs compliance"}]',
  '[{"institution":"Institute of Business Administration Karachi","degree":"BBA Finance","year":"2020"}]',
  '[{"name":"Associate Chartered Accountant","issuer":"ICAP","year":"2021"}]'
),

-- 13. Emma Thompson — Customs & Trade, UK (seasoned, verified)
(
  'e0230013-0000-0000-0000-000000000000',
  'd0230013-0000-0000-0000-000000000000',
  'emma-thompson',
  'Head of Customs & International Trade',
  'Advising UK and EU manufacturers, retailers, and logistics companies on customs classification, tariff management, and post-Brexit trade compliance.',
  'Emma Thompson is a customs and trade specialist with 16 years of experience, having started her career at HMRC before moving into Big Four advisory and finally establishing her own practice. She is a specialist in customs valuation, rules of origin, and customs duty planning, with particular expertise in the UK-EU trade relationship following Brexit. She holds authorised economic operator (AEO) accreditation.',
  'Manchester', 'GB', 'seasoned_professional',
  true, NOW() - INTERVAL '70 days', false,
  (SELECT id FROM services WHERE slug = 'customs-trade' LIMIT 1),
  16, 300, 900,
  'active', CURRENT_DATE - INTERVAL '145 days', CURRENT_DATE + INTERVAL '220 days',
  'https://linkedin.com/in/emma-thompson-customs',
  'https://thompsontradetax.co.uk',
  '[{"company":"Thompson Trade Advisory","title":"Founder & Director","from":"2020","to":"present","description":"Customs and trade compliance boutique for UK businesses"},{"company":"Deloitte UK","title":"Director — Customs & Global Trade","from":"2012","to":"2020","description":"Customs duty and trade compliance advisory"},{"company":"HMRC","title":"Customs Technical Adviser","from":"2008","to":"2012","description":"Customs classification and audit"}]',
  '[{"institution":"University of Manchester","degree":"LLM International Trade Law","year":"2008"},{"institution":"University of Leeds","degree":"BA Economics","year":"2006"}]',
  '[{"name":"Customs Freight Simplified Procedures Specialist","issuer":"HMRC","year":"2009"},{"name":"Authorised Economic Operator (AEO)","issuer":"HMRC","year":"2015"}]'
),

-- 14. Pierre Dubois — VAT Advisory, France (seasoned, verified)
(
  'e0230014-0000-0000-0000-000000000000',
  'd0230014-0000-0000-0000-000000000000',
  'pierre-dubois',
  'Directeur — TVA & Fiscalité Indirecte',
  'Advising French and European businesses on VAT compliance, registration, and optimisation across the EU, with expertise in digital services and e-commerce.',
  'Pierre Dubois is a French indirect tax expert with 18 years of experience advising multinationals on EU VAT compliance, VAT registrations across member states, and the One Stop Shop (OSS) regime for digital services. He has led VAT implementation projects for major e-commerce platforms and cross-border service providers, and regularly represents clients before the French tax administration.',
  'Paris', 'FR', 'seasoned_professional',
  true, NOW() - INTERVAL '85 days', false,
  (SELECT id FROM services WHERE slug = 'vat-advisory' LIMIT 1),
  18, 350, 1000,
  'active', CURRENT_DATE - INTERVAL '175 days', CURRENT_DATE + INTERVAL '190 days',
  'https://linkedin.com/in/pierre-dubois-vat',
  'https://duboisfiscal.fr',
  '[{"company":"Dubois Fiscalité","title":"Associé Fondateur","from":"2019","to":"present","description":"TVA et fiscalité indirecte pour les entreprises françaises et européennes"},{"company":"EY France","title":"Directeur — Fiscalité Indirecte","from":"2011","to":"2019","description":"TVA et obligations déclaratives multinationales"}]',
  '[{"institution":"Université Paris-Panthéon-Assas","degree":"Master 2 Fiscalité","year":"2006"},{"institution":"Sciences Po Paris","degree":"Diplôme","year":"2004"}]',
  '[{"name":"Avocat au Barreau de Paris","issuer":"Barreau de Paris","year":"2007"}]'
),

-- 15. Carlos Santos — Virtual CFO, Brazil (seasoned, verified, featured)
(
  'e0230015-0000-0000-0000-000000000000',
  'd0230015-0000-0000-0000-000000000000',
  'carlos-santos',
  'Virtual CFO & Finance Strategy Advisor',
  'Empowering Brazilian startups and SMEs with the financial leadership of a seasoned CFO — at a fraction of the cost.',
  'Carlos Santos is a seasoned Virtual CFO with 16 years of experience spanning investment banking, Big Four advisory, and CFO roles at high-growth startups. He has helped over 50 Brazilian companies raise capital, manage cash flow crises, and build world-class finance functions. He is fluent in English and Portuguese and regularly works with companies seeking to expand internationally.',
  'São Paulo', 'BR', 'seasoned_professional',
  true, NOW() - INTERVAL '55 days', true,
  (SELECT id FROM services WHERE slug = 'virtual-cfo' LIMIT 1),
  16, 250, 800,
  'active', CURRENT_DATE - INTERVAL '115 days', CURRENT_DATE + INTERVAL '250 days',
  'https://linkedin.com/in/carlos-santos-vcfo',
  'https://carlossantos.finance',
  '[{"company":"Santos CFO Services","title":"Virtual CFO","from":"2018","to":"present","description":"Fractional CFO services for 30+ Brazilian startups and SMEs"},{"company":"BTG Pactual","title":"Vice President — Investment Banking","from":"2012","to":"2018","description":"M&A and capital markets transactions"},{"company":"Deloitte Brazil","title":"Senior Manager — Transaction Services","from":"2008","to":"2012","description":"Financial due diligence and valuation"}]',
  '[{"institution":"FGV São Paulo","degree":"MBA Finance","year":"2010"},{"institution":"Universidade de São Paulo","degree":"BSc Economics","year":"2007"}]',
  '[{"name":"CFA Charterholder","issuer":"CFA Institute","year":"2011"},{"name":"CPA (USCPA)","issuer":"AICPA","year":"2014"}]'
),

-- 16. Yuki Tanaka — Financial Reporting, Japan (seasoned, verified)
(
  'e0230016-0000-0000-0000-000000000000',
  'd0230016-0000-0000-0000-000000000000',
  'yuki-tanaka',
  'Financial Reporting & IFRS Specialist',
  'Helping Japanese companies adopt IFRS, improve management reporting, and communicate financial performance clearly to global investors.',
  'Yuki Tanaka is a financial reporting specialist with 13 years of experience helping Japanese companies transition to and comply with IFRS. Having worked at EY Japan and a major Japanese trading house, she understands both the technical requirements and the cultural challenges of financial reporting transformation in Japan. She advises boards and CFOs on investor communications and reporting best practice.',
  'Tokyo', 'JP', 'seasoned_professional',
  true, NOW() - INTERVAL '40 days', false,
  (SELECT id FROM services WHERE slug = 'financial-reporting' LIMIT 1),
  13, 200, 700,
  'active', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days',
  'https://linkedin.com/in/yuki-tanaka-ifrs',
  NULL,
  '[{"company":"Tanaka Financial Advisory","title":"Representative Director","from":"2021","to":"present","description":"IFRS advisory and financial reporting consulting"},{"company":"Mitsui & Co.","title":"Group Financial Reporting Manager","from":"2016","to":"2021","description":"IFRS consolidated financial reporting"},{"company":"EY Japan","title":"Manager — Assurance","from":"2011","to":"2016","description":"IFRS audit and advisory"}]',
  '[{"institution":"Hitotsubashi University","degree":"MBA Finance","year":"2011"},{"institution":"Keio University","degree":"BA Commerce","year":"2009"}]',
  '[{"name":"Certified Public Accountant","issuer":"JICPA","year":"2012"},{"name":"IFRS Foundation Certificate in IFRS","issuer":"IFRS Foundation","year":"2014"}]'
),

-- 17. Amara Diallo — Bookkeeping, Senegal (budding)
(
  'e0230017-0000-0000-0000-000000000000',
  'd0230017-0000-0000-0000-000000000000',
  'amara-diallo',
  'Cloud Bookkeeping Specialist',
  'Helping West African SMEs set up modern bookkeeping systems using Xero and QuickBooks to keep their finances clean and investor-ready.',
  'Amara Diallo is a bookkeeping and accounting professional with 5 years of experience helping Senegalese and West African SMEs move from manual ledgers to cloud-based accounting systems. He specialises in Xero and QuickBooks implementation, monthly management accounts, and preparing businesses for their first formal audit.',
  'Dakar', 'SN', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'bookkeeping' LIMIT 1),
  5, 40, 120,
  'active', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE + INTERVAL '315 days',
  'https://linkedin.com/in/amara-diallo-bookkeeping',
  NULL,
  '[{"company":"DigiCount Senegal","title":"Founder","from":"2022","to":"present","description":"Cloud bookkeeping services for West African SMEs"},{"company":"CCA Chartered Accountants","title":"Accounts Associate","from":"2019","to":"2022","description":"Bookkeeping and financial reporting"}]',
  '[{"institution":"Université Cheikh Anta Diop","degree":"Licence Comptabilité","year":"2019"}]',
  '[{"name":"Xero Certified Advisor","issuer":"Xero","year":"2022"}]'
),

-- 18. Grace Kim — Management Accounts, South Korea (seasoned, verified)
(
  'e0230018-0000-0000-0000-000000000000',
  'd0230018-0000-0000-0000-000000000000',
  'grace-kim',
  'CFO & Management Accounting Director',
  'Designing management reporting frameworks and monthly board packs that give Korean and international businesses the financial clarity to make better decisions.',
  'Grace Kim has 14 years of experience in management accounting, financial planning & analysis, and CFO advisory across South Korea and Southeast Asia. She has built and transformed FP&A functions at technology companies, consumer businesses, and private equity-backed firms. She is passionate about making management information clear, timely, and actionable.',
  'Seoul', 'KR', 'seasoned_professional',
  true, NOW() - INTERVAL '60 days', false,
  (SELECT id FROM services WHERE slug = 'management-accounts' LIMIT 1),
  14, 200, 700,
  'active', CURRENT_DATE - INTERVAL '125 days', CURRENT_DATE + INTERVAL '240 days',
  'https://linkedin.com/in/grace-kim-cfo',
  NULL,
  '[{"company":"GK Advisory","title":"Principal CFO Advisor","from":"2020","to":"present","description":"Fractional CFO and management accounting for Korean tech companies"},{"company":"Kakao Corp","title":"Finance Director","from":"2015","to":"2020","description":"Financial planning and management reporting"},{"company":"Samsung Electronics","title":"Senior Financial Analyst","from":"2010","to":"2015","description":"Business unit FP&A and management accounts"}]',
  '[{"institution":"Yonsei University","degree":"MBA Finance","year":"2010"},{"institution":"Seoul National University","degree":"BA Business Administration","year":"2008"}]',
  '[{"name":"Chartered Management Accountant","issuer":"CIMA","year":"2012"}]'
),

-- 19. Simon De Beer — Virtual CFO, South Africa (seasoned, verified, featured)
(
  'e0230019-0000-0000-0000-000000000000',
  'd0230019-0000-0000-0000-000000000000',
  'simon-de-beer',
  'Virtual CFO & Growth Finance Advisor',
  'Helping South African and pan-African growth companies build robust finance functions and raise capital from local and international investors.',
  'Simon De Beer is a Chartered Accountant and Virtual CFO with 15 years of experience across audit, investment banking, and CFO roles. He has helped over 40 South African SMEs and startups access equity and debt funding, set up finance teams, and navigate SARS compliance. He is a trusted advisor to founders navigating their first institutional funding round.',
  'Johannesburg', 'ZA', 'seasoned_professional',
  true, NOW() - INTERVAL '70 days', true,
  (SELECT id FROM services WHERE slug = 'virtual-cfo' LIMIT 1),
  15, 200, 700,
  'active', CURRENT_DATE - INTERVAL '135 days', CURRENT_DATE + INTERVAL '230 days',
  'https://linkedin.com/in/simon-debeer-vcfo',
  'https://simondebeer.finance',
  '[{"company":"De Beer CFO Services","title":"Virtual CFO","from":"2018","to":"present","description":"Fractional CFO services for South African growth companies"},{"company":"Investec Bank","title":"Vice President — Corporate Finance","from":"2013","to":"2018","description":"M&A and growth capital advisory"},{"company":"Deloitte South Africa","title":"Audit Manager","from":"2009","to":"2013","description":"Financial services audit and advisory"}]',
  '[{"institution":"University of Cape Town","degree":"BCom Honours Accounting","year":"2009"},{"institution":"University of Stellenbosch","degree":"BCom","year":"2007"}]',
  '[{"name":"Chartered Accountant (CA(SA))","issuer":"SAICA","year":"2010"},{"name":"CFA Charterholder","issuer":"CFA Institute","year":"2013"}]'
),

-- 20. Nadia Hassan — Financial Reporting, Egypt (seasoned, verified)
(
  'e0230020-0000-0000-0000-000000000000',
  'd0230020-0000-0000-0000-000000000000',
  'nadia-hassan',
  'Financial Reporting & External Audit Director',
  'Advising Egyptian and regional companies on IFRS adoption, financial statement preparation, and liaison with external auditors.',
  'Nadia Hassan is a Cairo-based financial reporting expert with 12 years of experience across Big Four audit, banking, and advisory. She has led IFRS implementation projects for Egyptian banks, real estate developers, and manufacturing companies, and has deep expertise in IFRS 9, IFRS 16, and IFRS 15. She advises CFOs on audit readiness and financial communication.',
  'Cairo', 'EG', 'seasoned_professional',
  true, NOW() - INTERVAL '35 days', false,
  (SELECT id FROM services WHERE slug = 'financial-reporting' LIMIT 1),
  12, 100, 400,
  'active', CURRENT_DATE - INTERVAL '80 days', CURRENT_DATE + INTERVAL '285 days',
  'https://linkedin.com/in/nadia-hassan-ifrs',
  NULL,
  '[{"company":"Hassan Financial Advisory","title":"Director","from":"2021","to":"present","description":"IFRS advisory and financial reporting for Egyptian companies"},{"company":"Ernst & Young Egypt","title":"Senior Manager","from":"2015","to":"2021","description":"Audit and IFRS advisory for financial services"},{"company":"Commercial International Bank","title":"Financial Analyst","from":"2012","to":"2015","description":"Group financial reporting"}]',
  '[{"institution":"Cairo University","degree":"BCom Accounting","year":"2012"}]',
  '[{"name":"Chartered Accountant","issuer":"ICPA Egypt","year":"2013"},{"name":"IFRS Diploma","issuer":"ACCA","year":"2016"}]'
),

-- 21. Patrick O'Reilly — Payroll, Ireland (budding)
(
  'e0230021-0000-0000-0000-000000000000',
  'd0230021-0000-0000-0000-000000000000',
  'patrick-oreilly',
  'Payroll & Employment Tax Specialist',
  'Managing Irish payroll compliance, PAYE/PRSI submissions, and employment tax advisory for SMEs and international companies with Irish operations.',
  'Patrick O''Reilly is an Irish payroll specialist with 6 years of experience managing payroll for businesses ranging from 5 to 500 employees. He specialises in setting up payroll systems for international companies entering the Irish market, managing expat payroll tax, and handling Revenue audits on employment taxes.',
  'Dublin', 'IE', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'payroll' LIMIT 1),
  6, 60, 200,
  'active', CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE + INTERVAL '310 days',
  'https://linkedin.com/in/patrick-oreilly-payroll',
  NULL,
  '[{"company":"O''Reilly Payroll Services","title":"Founder","from":"2021","to":"present","description":"Payroll compliance and employment tax for Irish SMEs"},{"company":"PwC Ireland","title":"Payroll & Employment Tax Senior","from":"2018","to":"2021","description":"Payroll compliance and employment tax advisory"}]',
  '[{"institution":"University College Dublin","degree":"BCom","year":"2018"}]',
  '[{"name":"IPASS Payroll Technician","issuer":"IPASS","year":"2019"}]'
),

-- 22. Andrew Fitzgerald — Due Diligence, Ireland (seasoned, verified)
(
  'e0230022-0000-0000-0000-000000000000',
  'd0230022-0000-0000-0000-000000000000',
  'andrew-fitzgerald',
  'Transaction Services & Due Diligence Director',
  'Leading financial and commercial due diligence assignments for private equity and strategic buyers across Ireland and the UK.',
  'Andrew Fitzgerald is a Transaction Services specialist with 17 years of experience leading buy-side and sell-side due diligence for private equity, venture capital, and strategic acquirers across Ireland, the UK, and Europe. He has completed over 120 transactions across technology, healthcare, financial services, and consumer sectors, and is known for finding the critical issues that change deal terms.',
  'Dublin', 'IE', 'seasoned_professional',
  true, NOW() - INTERVAL '90 days', false,
  (SELECT id FROM services WHERE slug = 'due-diligence' LIMIT 1),
  17, 500, 1500,
  'active', CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '185 days',
  'https://linkedin.com/in/andrew-fitzgerald-ts',
  'https://fitzgeraldtransactions.ie',
  '[{"company":"Fitzgerald Transaction Services","title":"Principal","from":"2020","to":"present","description":"Independent transaction services and due diligence practice"},{"company":"Deloitte Ireland","title":"Director — Transaction Services","from":"2013","to":"2020","description":"Financial due diligence for PE and strategic buyers"},{"company":"KPMG Ireland","title":"Manager — Audit","from":"2007","to":"2013","description":"Audit and assurance"}]',
  '[{"institution":"University College Cork","degree":"BCom Accounting","year":"2007"}]',
  '[{"name":"Chartered Accountant (ACA)","issuer":"Chartered Accountants Ireland","year":"2008"},{"name":"Certified Due Diligence Professional","issuer":"ACII","year":"2015"}]'
),

-- 23. Olumide Adeleke — Statutory Audit, Nigeria (seasoned, verified)
(
  'e0230023-0000-0000-0000-000000000000',
  'd0230023-0000-0000-0000-000000000000',
  'olumide-adeleke',
  'Audit Partner — Financial Services',
  'Providing statutory audit, assurance, and financial reporting advisory to Nigerian banks, insurance companies, and capital market operators.',
  'Olumide Adeleke is a Chartered Accountant with 16 years of audit and assurance experience in Nigeria, with a particular focus on financial services. He has served as engagement partner on statutory audits for three Nigerian Tier-1 banks and numerous insurance companies. He advises boards and audit committees on regulatory reporting, internal controls, and fraud prevention.',
  'Lagos', 'NG', 'seasoned_professional',
  true, NOW() - INTERVAL '75 days', false,
  (SELECT id FROM services WHERE slug = 'statutory-audit' LIMIT 1),
  16, 200, 700,
  'active', CURRENT_DATE - INTERVAL '155 days', CURRENT_DATE + INTERVAL '210 days',
  'https://linkedin.com/in/olumide-adeleke-audit',
  'https://adelekeaudit.com.ng',
  '[{"company":"Adeleke & Co. Chartered Accountants","title":"Senior Partner","from":"2019","to":"present","description":"Audit and assurance for Nigerian financial institutions"},{"company":"KPMG Nigeria","title":"Audit Senior Manager","from":"2013","to":"2019","description":"Financial services audit and advisory"}]',
  '[{"institution":"University of Lagos","degree":"BSc Accounting","year":"2008"}]',
  '[{"name":"Fellow, Institute of Chartered Accountants of Nigeria","issuer":"ICAN","year":"2015"},{"name":"Associate Member, Chartered Institute of Taxation","issuer":"CITN","year":"2016"}]'
),

-- 24. Ingeborg Larsen — Internal Audit, Norway (seasoned, verified)
(
  'e0230024-0000-0000-0000-000000000000',
  'd0230024-0000-0000-0000-000000000000',
  'ingeborg-larsen',
  'Head of Internal Audit & Risk Advisory',
  'Building high-performing internal audit functions for Norwegian and Nordic companies, with expertise in oil & gas, shipping, and financial services.',
  'Ingeborg Larsen is a senior internal audit and risk professional with 19 years of experience in Norway and across the Nordics. She has served as Chief Audit Executive for two Norwegian oil companies and has advised over 25 boards on audit committee effectiveness, risk management frameworks, and internal control design. She is a Certified Internal Auditor and a former Norges Bank examiner.',
  'Oslo', 'NO', 'seasoned_professional',
  true, NOW() - INTERVAL '85 days', false,
  (SELECT id FROM services WHERE slug = 'internal-audit' LIMIT 1),
  19, 500, 1500,
  'active', CURRENT_DATE - INTERVAL '170 days', CURRENT_DATE + INTERVAL '195 days',
  'https://linkedin.com/in/ingeborg-larsen-audit',
  'https://larsenriskadvisory.no',
  '[{"company":"Larsen Risk Advisory","title":"Managing Director","from":"2020","to":"present","description":"Internal audit and risk advisory for Norwegian corporates"},{"company":"Equinor","title":"Chief Internal Auditor","from":"2014","to":"2020","description":"Global internal audit function"},{"company":"PwC Norway","title":"Director — Internal Audit","from":"2005","to":"2014","description":"Internal audit and risk management advisory"}]',
  '[{"institution":"BI Norwegian Business School","degree":"MSc Finance","year":"2005"},{"institution":"University of Oslo","degree":"BA Economics","year":"2003"}]',
  '[{"name":"Certified Internal Auditor (CIA)","issuer":"IIA","year":"2007"},{"name":"Certified in Risk and Information Systems Control (CRISC)","issuer":"ISACA","year":"2012"}]'
),

-- 25. Li Wei — Forensic Audit, China (seasoned)
(
  'e0230025-0000-0000-0000-000000000000',
  'd0230025-0000-0000-0000-000000000000',
  'li-wei',
  'Forensic Accounting & Fraud Investigation Director',
  'Uncovering financial fraud, management misconduct, and accounting irregularities for Chinese and multinational companies.',
  'Li Wei is a forensic accounting specialist with 13 years of experience conducting financial investigations and fraud examinations for listed companies, private equity sponsors, and law firms. He has led investigations across manufacturing, real estate, and technology sectors and has testified as an expert witness in arbitration proceedings. He is based in Beijing and works across Greater China.',
  'Beijing', 'CN', 'seasoned_professional',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'forensic-audit' LIMIT 1),
  13, 300, 1000,
  'active', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days',
  'https://linkedin.com/in/li-wei-forensic',
  NULL,
  '[{"company":"Wei Forensic Advisory","title":"Director","from":"2020","to":"present","description":"Forensic accounting and fraud investigation"},{"company":"FTI Consulting China","title":"Senior Managing Director","from":"2014","to":"2020","description":"Forensic investigations and litigation support"},{"company":"Deloitte China","title":"Manager — Forensic","from":"2011","to":"2014","description":"Financial fraud investigations"}]',
  '[{"institution":"Peking University","degree":"MBA","year":"2011"},{"institution":"Renmin University of China","degree":"BA Accounting","year":"2009"}]',
  '[{"name":"Certified Fraud Examiner","issuer":"ACFE","year":"2013"},{"name":"Certified Public Accountant","issuer":"CICPA","year":"2010"}]'
),

-- 26. Kavya Nair — Internal Audit, India (budding)
(
  'e0230026-0000-0000-0000-000000000000',
  'd0230026-0000-0000-0000-000000000000',
  'kavya-nair',
  'Internal Audit & Risk Analyst',
  'Supporting Indian companies with internal audit execution, process reviews, and risk control self-assessments to strengthen governance.',
  'Kavya Nair is an internal audit professional with 4 years of experience conducting process audits, control testing, and risk assessments across manufacturing, IT, and financial services companies in India. She is a Certified Internal Auditor candidate and has experience with SOX compliance, COSO framework implementation, and audit management software.',
  'Kochi', 'IN', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'internal-audit' LIMIT 1),
  4, 40, 130,
  'active', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE + INTERVAL '325 days',
  'https://linkedin.com/in/kavya-nair-audit',
  NULL,
  '[{"company":"Independent Audit Consultant","title":"Internal Audit Consultant","from":"2023","to":"present","description":"Internal audit and process reviews for Indian companies"},{"company":"Grant Thornton India","title":"Internal Audit Associate","from":"2020","to":"2023","description":"Internal audit and risk advisory for mid-market clients"}]',
  '[{"institution":"Government Law College Kerala","degree":"LLB","year":"2020"},{"institution":"Mahatma Gandhi University","degree":"BCom Finance","year":"2018"}]',
  '[{"name":"Chartered Accountant (Intermediate)","issuer":"ICAI","year":"2021"}]'
),

-- 27. Rami Al-Sayed — Due Diligence, Lebanon/UAE (seasoned, verified)
(
  'e0230027-0000-0000-0000-000000000000',
  'd0230027-0000-0000-0000-000000000000',
  'rami-al-sayed',
  'M&A Due Diligence & Restructuring Advisor',
  'Supporting investors and lenders across the MENA region with financial due diligence, business valuations, and debt restructuring advisory.',
  'Rami Al-Sayed is a transaction advisory specialist with 14 years of experience across the MENA region, having worked in Beirut, Dubai, and Riyadh. He has led financial due diligence on over 60 transactions across real estate, retail, logistics, and healthcare sectors, and has extensive experience with distressed business situations and debt restructuring assignments.',
  'Beirut', 'LB', 'seasoned_professional',
  true, NOW() - INTERVAL '50 days', false,
  (SELECT id FROM services WHERE slug = 'due-diligence' LIMIT 1),
  14, 250, 800,
  'active', CURRENT_DATE - INTERVAL '105 days', CURRENT_DATE + INTERVAL '260 days',
  'https://linkedin.com/in/rami-alsayed-ma',
  NULL,
  '[{"company":"Al-Sayed Advisory Partners","title":"Managing Partner","from":"2021","to":"present","description":"Transaction advisory and restructuring across MENA"},{"company":"PwC Middle East","title":"Director — Transaction Services","from":"2015","to":"2021","description":"Financial due diligence across MENA markets"}]',
  '[{"institution":"American University of Beirut","degree":"MBA Finance","year":"2010"},{"institution":"Lebanese American University","degree":"BSc Accounting","year":"2008"}]',
  '[{"name":"Chartered Financial Analyst","issuer":"CFA Institute","year":"2012"},{"name":"Chartered Accountant","issuer":"LACPA","year":"2011"}]'
),

-- 28. Marcus Adeyemi — M&A Advisory, Nigeria (seasoned, verified, featured)
(
  'e0230028-0000-0000-0000-000000000000',
  'd0230028-0000-0000-0000-000000000000',
  'marcus-adeyemi',
  'Managing Partner — Corporate Finance & M&A',
  'Advising African businesses and international investors on mergers, acquisitions, and capital raises across West and East Africa.',
  'Marcus Adeyemi is a leading African M&A advisor with 18 years of experience originating and executing cross-border transactions across Nigeria, Ghana, Kenya, and South Africa. He has advised on landmark transactions in banking, telecoms, energy, and consumer goods, and is a trusted board-level advisor on strategic corporate development. He is a graduate of Harvard Business School.',
  'Abuja', 'NG', 'seasoned_professional',
  true, NOW() - INTERVAL '100 days', true,
  (SELECT id FROM services WHERE slug = 'ma-advisory' LIMIT 1),
  18, 500, 2000,
  'active', CURRENT_DATE - INTERVAL '190 days', CURRENT_DATE + INTERVAL '175 days',
  'https://linkedin.com/in/marcus-adeyemi-ma',
  'https://adeyemicorporatefinance.com',
  '[{"company":"Adeyemi Corporate Finance","title":"Managing Partner","from":"2017","to":"present","description":"Pan-African M&A advisory boutique"},{"company":"Standard Chartered Bank","title":"Managing Director — Investment Banking","from":"2011","to":"2017","description":"Africa-focused M&A and ECM transactions"},{"company":"Goldman Sachs","title":"Vice President","from":"2006","to":"2011","description":"Sub-Saharan Africa corporate finance"}]',
  '[{"institution":"Harvard Business School","degree":"MBA","year":"2006"},{"institution":"University of Lagos","degree":"LLB","year":"2003"}]',
  '[{"name":"Barrister and Solicitor","issuer":"Nigerian Bar Association","year":"2004"},{"name":"Chartered Financial Analyst","issuer":"CFA Institute","year":"2008"}]'
),

-- 29. Soo-Jin Park — Securities Law, South Korea (seasoned, verified)
(
  'e0230029-0000-0000-0000-000000000000',
  'd0230029-0000-0000-0000-000000000000',
  'soojin-park',
  'Partner — Capital Markets & Securities Regulation',
  'Advising Korean and international issuers, underwriters, and investors on IPOs, secondary offerings, and securities regulatory compliance in Korea.',
  'Soo-Jin Park is a capital markets attorney with 15 years of experience at leading Korean and international law firms. She has led the securities law work on over 40 Korean IPOs, including several high-profile tech listings on KOSDAQ, and advises international banks on Korean market entry and securities distribution. She is a ranked practitioner in Chambers Asia Pacific.',
  'Seoul', 'KR', 'seasoned_professional',
  true, NOW() - INTERVAL '65 days', false,
  (SELECT id FROM services WHERE slug = 'securities-law' LIMIT 1),
  15, 400, 1400,
  'active', CURRENT_DATE - INTERVAL '130 days', CURRENT_DATE + INTERVAL '235 days',
  'https://linkedin.com/in/soojin-park-securities',
  NULL,
  '[{"company":"Kim & Chang","title":"Partner — Capital Markets","from":"2018","to":"present","description":"Korean IPOs, secondary offerings, and securities regulatory compliance"},{"company":"Cleary Gottlieb","title":"Associate — Capital Markets","from":"2011","to":"2018","description":"Cross-border capital markets transactions"}]',
  '[{"institution":"Seoul National University School of Law","degree":"LLM","year":"2010"},{"institution":"Yonsei University","degree":"LLB","year":"2008"}]',
  '[{"name":"Korean Bar Association Member","issuer":"Korean Bar Association","year":"2010"},{"name":"New York State Bar Admission","issuer":"NYSBA","year":"2012"}]'
),

-- 30. Rebecca McAllister — Corporate Governance, UK (seasoned, verified)
(
  'e0230030-0000-0000-0000-000000000000',
  'd0230030-0000-0000-0000-000000000000',
  'rebecca-mcallister',
  'Corporate Governance Advisor & NED',
  'Advising FTSE companies and private equity-backed boards on corporate governance frameworks, board effectiveness, and ESG accountability.',
  'Rebecca McAllister is a senior governance professional and Non-Executive Director with 20 years of experience in UK and international corporate governance. She has served on the governance committees of three FTSE 250 companies and has led board effectiveness reviews for over 30 organisations. She is a regular commentator on the UK Corporate Governance Code and chairs the audit committee of two listed companies.',
  'Edinburgh', 'GB', 'seasoned_professional',
  true, NOW() - INTERVAL '95 days', false,
  (SELECT id FROM services WHERE slug = 'corporate-governance' LIMIT 1),
  20, 600, 2000,
  'active', CURRENT_DATE - INTERVAL '185 days', CURRENT_DATE + INTERVAL '180 days',
  'https://linkedin.com/in/rebecca-mcallister-governance',
  'https://mcallistergov.co.uk',
  '[{"company":"McAllister Governance Consulting","title":"Principal Advisor","from":"2019","to":"present","description":"Corporate governance advisory and NED services"},{"company":"Scottish Widows Group","title":"Company Secretary & Group Head of Governance","from":"2012","to":"2019","description":"Group governance, board support, and regulatory compliance"}]',
  '[{"institution":"University of Edinburgh","degree":"LLM Corporate Law","year":"2004"},{"institution":"University of Glasgow","degree":"LLB","year":"2002"}]',
  '[{"name":"Fellow, Chartered Governance Institute (FCIS)","issuer":"CGI","year":"2010"},{"name":"Chartered Director","issuer":"IoD","year":"2015"}]'
),

-- 31. Lorenzo Ferrari — Company Incorporation, Italy (seasoned, verified)
(
  'e0230031-0000-0000-0000-000000000000',
  'd0230031-0000-0000-0000-000000000000',
  'lorenzo-ferrari',
  'Corporate Lawyer — Italian & EU Company Law',
  'Helping international businesses establish legal entities in Italy, navigate Italian corporate law, and comply with EU regulatory requirements.',
  'Lorenzo Ferrari is an Italian corporate lawyer with 14 years of experience advising foreign companies on setting up and managing Italian subsidiaries, joint ventures, and branches. He has guided over 200 companies through Italian company incorporation, from shelf company acquisition to full regulatory licensing. He is dual-qualified in Italy and the EU and advises clients across the automotive, fashion, and luxury goods sectors.',
  'Milan', 'IT', 'seasoned_professional',
  true, NOW() - INTERVAL '70 days', false,
  (SELECT id FROM services WHERE slug = 'company-incorporation' LIMIT 1),
  14, 300, 900,
  'active', CURRENT_DATE - INTERVAL '140 days', CURRENT_DATE + INTERVAL '225 days',
  'https://linkedin.com/in/lorenzo-ferrari-lawyer',
  'https://ferrarilegal.it',
  '[{"company":"Ferrari & Associati Studio Legale","title":"Managing Partner","from":"2018","to":"present","description":"Italian corporate law and EU company establishment"},{"company":"Freshfields Bruckhaus Deringer Milan","title":"Associate — Corporate","from":"2011","to":"2018","description":"Italian and cross-border corporate transactions"}]',
  '[{"institution":"Università Bocconi","degree":"LLM Business Law","year":"2010"},{"institution":"Università degli Studi di Milano","degree":"JD Law","year":"2008"}]',
  '[{"name":"Avvocato (Italian Bar)","issuer":"Ordine degli Avvocati di Milano","year":"2011"},{"name":"Euroadvocate","issuer":"CCBE","year":"2014"}]'
),

-- 32. Zara Ahmed — Regulatory Compliance, UAE (seasoned, verified)
(
  'e0230032-0000-0000-0000-000000000000',
  'd0230032-0000-0000-0000-000000000000',
  'zara-ahmed',
  'Regulatory Compliance Director — Financial Services',
  'Helping UAE and GCC financial institutions navigate CBUAE, DFSA, and ADGM regulatory frameworks and build robust compliance programmes.',
  'Zara Ahmed is a financial services regulatory specialist with 13 years of experience at central banks, the DFSA, and in private practice. She has led licensing applications for over 20 financial institutions in the UAE, designed AML/CFT compliance frameworks for international banks, and advised boards on regulatory change management. She is a Certified Anti-Money Laundering Specialist.',
  'Dubai', 'AE', 'seasoned_professional',
  true, NOW() - INTERVAL '55 days', false,
  (SELECT id FROM services WHERE slug = 'regulatory-compliance' LIMIT 1),
  13, 400, 1200,
  'active', CURRENT_DATE - INTERVAL '110 days', CURRENT_DATE + INTERVAL '255 days',
  'https://linkedin.com/in/zara-ahmed-compliance',
  'https://ahmedregulatory.ae',
  '[{"company":"Ahmed Regulatory Advisory","title":"Director & Founder","from":"2021","to":"present","description":"Regulatory compliance for UAE and GCC financial institutions"},{"company":"Dubai Financial Services Authority (DFSA)","title":"Senior Regulatory Adviser","from":"2016","to":"2021","description":"Financial services licensing and prudential supervision"},{"company":"Citibank UAE","title":"Compliance Manager","from":"2011","to":"2016","description":"AML/CFT and regulatory compliance"}]',
  '[{"institution":"American University of Dubai","degree":"MBA Finance","year":"2011"},{"institution":"University of Jordan","degree":"LLB","year":"2009"}]',
  '[{"name":"Certified Anti-Money Laundering Specialist (CAMS)","issuer":"ACAMS","year":"2013"},{"name":"ICA Certificate in Compliance","issuer":"ICA","year":"2015"}]'
),

-- 33. Hugo Leclerc — M&A Advisory, France (seasoned)
(
  'e0230033-0000-0000-0000-000000000000',
  'd0230033-0000-0000-0000-000000000000',
  'hugo-leclerc',
  'M&A & Corporate Finance Partner',
  'Advising French mid-market companies and PE sponsors on acquisitions, disposals, and capital raising across France and the Francophone world.',
  'Hugo Leclerc is a French M&A banker with 15 years of experience advising mid-market companies and private equity sponsors on mergers, acquisitions, and growth financing in France and across Francophone Africa. He has closed over 50 transactions with aggregate value exceeding €2 billion, with a focus on the food & beverage, healthcare, and technology sectors.',
  'Lyon', 'FR', 'seasoned_professional',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'ma-advisory' LIMIT 1),
  15, 400, 1400,
  'active', CURRENT_DATE - INTERVAL '125 days', CURRENT_DATE + INTERVAL '240 days',
  'https://linkedin.com/in/hugo-leclerc-ma',
  NULL,
  '[{"company":"Leclerc & Associés","title":"Associé Fondateur","from":"2019","to":"present","description":"Banque d affaires mid-market en France et Afrique francophone"},{"company":"Rothschild & Co France","title":"Director — M&A","from":"2013","to":"2019","description":"M&A advisory for mid-market French companies"}]',
  '[{"institution":"HEC Paris","degree":"Grande École (Finance)","year":"2009"},{"institution":"Sciences Po Paris","degree":"Diplôme","year":"2007"}]',
  '[{"name":"Certified Financial Analyst","issuer":"CFA Institute","year":"2012"}]'
),

-- 34. Chen Wei — Securities Law, China (seasoned)
(
  'e0230034-0000-0000-0000-000000000000',
  'd0230034-0000-0000-0000-000000000000',
  'chen-wei-law',
  'Partner — Securities & Capital Markets Law',
  'Advising Chinese issuers, underwriters, and foreign investors on A-share listings, H-share offerings, and CSRC regulatory compliance.',
  'Chen Wei is a capital markets lawyer with 12 years of experience advising on Chinese domestic and cross-border securities transactions. He has worked on over 30 A-share IPOs on the Shanghai Stock Exchange and Shenzhen ChiNext board, as well as several H-share listings in Hong Kong. He advises foreign institutional investors on QFII/RQFII programme compliance and cross-border investments.',
  'Shanghai', 'CN', 'seasoned_professional',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'securities-law' LIMIT 1),
  12, 300, 1000,
  'active', CURRENT_DATE - INTERVAL '105 days', CURRENT_DATE + INTERVAL '260 days',
  'https://linkedin.com/in/chen-wei-securities',
  NULL,
  '[{"company":"Han Kun Law Offices","title":"Partner — Capital Markets","from":"2018","to":"present","description":"Chinese domestic and cross-border capital markets transactions"},{"company":"Sullivan & Cromwell Hong Kong","title":"Associate","from":"2012","to":"2018","description":"Cross-border securities offerings and M&A"}]',
  '[{"institution":"Tsinghua University School of Law","degree":"LLM","year":"2012"},{"institution":"Fudan University","degree":"LLB","year":"2009"}]',
  '[{"name":"PRC Lawyer Qualification","issuer":"Ministry of Justice PRC","year":"2012"},{"name":"New York Bar Admission","issuer":"NYSBA","year":"2014"}]'
),

-- 35. Priyanka Sinha — Corporate Governance, India (seasoned, verified)
(
  'e0230035-0000-0000-0000-000000000000',
  'd0230035-0000-0000-0000-000000000000',
  'priyanka-sinha',
  'Company Secretary & Corporate Governance Advisor',
  'Advising listed Indian companies on SEBI Listing Regulations, Companies Act compliance, and board governance best practices.',
  'Priyanka Sinha is a qualified Company Secretary with 13 years of experience in corporate governance, SEBI compliance, and Secretarial Audit for Indian listed companies. She has managed board and committee processes for Nifty 50 companies, led compliance overhauls for newly listed entities, and advised promoters on related party transaction governance. She is a frequent speaker at the ICSI events.',
  'Mumbai', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '60 days', false,
  (SELECT id FROM services WHERE slug = 'corporate-governance' LIMIT 1),
  13, 100, 350,
  'active', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '245 days',
  'https://linkedin.com/in/priyanka-sinha-cs',
  NULL,
  '[{"company":"Sinha Corporate Secretarial","title":"Principal","from":"2020","to":"present","description":"Corporate governance and SEBI compliance advisory for Indian listed companies"},{"company":"Tata Consultancy Services","title":"Head of Corporate Secretarial","from":"2015","to":"2020","description":"Board governance, SEBI compliance, and annual reporting"},{"company":"Mahindra & Mahindra","title":"Deputy Company Secretary","from":"2011","to":"2015","description":"Corporate secretarial and compliance functions"}]',
  '[{"institution":"National Law School of India University","degree":"LLB","year":"2011"},{"institution":"Mumbai University","degree":"BCom","year":"2009"}]',
  '[{"name":"Fellow Company Secretary (FCS)","issuer":"ICSI","year":"2013"},{"name":"Insolvency Professional","issuer":"IBBI","year":"2019"}]'
),

-- 36. Tariq Osman — Company Incorporation, Kenya (budding)
(
  'e0230036-0000-0000-0000-000000000000',
  'd0230036-0000-0000-0000-000000000000',
  'tariq-osman',
  'Corporate Lawyer — East African Company Formation',
  'Helping foreign investors and East African entrepreneurs incorporate companies in Kenya, Ethiopia, and the broader EAC region.',
  'Tariq Osman is a Kenyan corporate lawyer with 5 years of experience guiding local and international businesses through company registration, regulatory licensing, and shareholder agreement preparation in Kenya and the East Africa Community. He has a particular focus on fintech and agritech startups accessing EAC markets.',
  'Nairobi', 'KE', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'company-incorporation' LIMIT 1),
  5, 60, 200,
  'active', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE + INTERVAL '330 days',
  'https://linkedin.com/in/tariq-osman-kenya',
  NULL,
  '[{"company":"Osman Legal Partners","title":"Founder","from":"2022","to":"present","description":"Company formation and corporate law for East African businesses"},{"company":"Anjarwalla & Khanna","title":"Associate Lawyer","from":"2019","to":"2022","description":"Corporate and commercial law in Kenya"}]',
  '[{"institution":"University of Nairobi School of Law","degree":"LLB","year":"2019"}]',
  '[{"name":"Advocate of the High Court of Kenya","issuer":"Law Society of Kenya","year":"2019"}]'
),

-- 37. Pilar Morales — Contract Drafting, Spain (seasoned, verified)
(
  'e0230037-0000-0000-0000-000000000000',
  'd0230037-0000-0000-0000-000000000000',
  'pilar-morales',
  'Senior Commercial Lawyer — Contracts & Technology',
  'Drafting and negotiating complex commercial contracts for technology companies, SaaS providers, and professional services firms across Spain and LATAM.',
  'Pilar Morales is a commercial law specialist with 15 years of experience drafting and negotiating technology agreements, SaaS contracts, distribution agreements, and professional services frameworks for Spanish and Latin American companies. She has advised some of Spain''s fastest-growing tech companies on their standard contract templates and negotiated framework agreements with Fortune 500 procurement teams.',
  'Madrid', 'ES', 'seasoned_professional',
  true, NOW() - INTERVAL '75 days', false,
  (SELECT id FROM services WHERE slug = 'contract-drafting' LIMIT 1),
  15, 250, 800,
  'active', CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE + INTERVAL '215 days',
  'https://linkedin.com/in/pilar-morales-contratos',
  'https://moralescontractlaw.es',
  '[{"company":"Morales Legal — Contratos Comerciales","title":"Socia Fundadora","from":"2019","to":"present","description":"Contratos tecnológicos y comerciales para empresas tecnológicas"},{"company":"Garrigues","title":"Counsel — Derecho Mercantil","from":"2012","to":"2019","description":"Contratos tecnológicos, distribución y franquicias"}]',
  '[{"institution":"Universidad Complutense de Madrid","degree":"LLM Derecho Privado Europeo","year":"2009"},{"institution":"Universidad de Salamanca","degree":"Licenciatura en Derecho","year":"2007"}]',
  '[{"name":"Abogada — Colegio de Abogados de Madrid","issuer":"ICAM","year":"2010"}]'
),

-- 38. Kwame Asante — Employment Law, Ghana (seasoned, verified)
(
  'e0230038-0000-0000-0000-000000000000',
  'd0230038-0000-0000-0000-000000000000',
  'kwame-asante',
  'Head of Labour & Employment Law',
  'Advising employers and executives across Ghana on employment contracts, wrongful dismissal claims, and Ghana Labour Act compliance.',
  'Kwame Asante is a leading Ghanaian employment lawyer with 14 years of experience representing employers in employment tribunals and advising boards on workforce strategy and HR legal risk. He has managed redundancy processes for multinational companies in Ghana, advised on executive employment packages, and represented clients in the National Labour Commission. He is ranked in Legal 500 EMEA.',
  'Accra', 'GH', 'seasoned_professional',
  true, NOW() - INTERVAL '80 days', false,
  (SELECT id FROM services WHERE slug = 'employment-law' LIMIT 1),
  14, 150, 500,
  'active', CURRENT_DATE - INTERVAL '160 days', CURRENT_DATE + INTERVAL '205 days',
  'https://linkedin.com/in/kwame-asante-employment',
  'https://asanteemploymentlaw.gh',
  '[{"company":"Asante & Partners — Labour Law","title":"Managing Partner","from":"2017","to":"present","description":"Employment law and labour relations advisory in Ghana"},{"company":"Reindorf Chambers","title":"Principal Associate","from":"2011","to":"2017","description":"Labour and employment law practice"}]',
  '[{"institution":"Ghana School of Law","degree":"BL","year":"2011"},{"institution":"University of Ghana","degree":"LLB","year":"2010"}]',
  '[{"name":"Barrister and Solicitor of the Supreme Court of Ghana","issuer":"Ghana Bar Association","year":"2011"}]'
),

-- 39. Sophie Laurent — Intellectual Property, Belgium (seasoned, verified)
(
  'e0230039-0000-0000-0000-000000000000',
  'd0230039-0000-0000-0000-000000000000',
  'sophie-laurent',
  'IP & Technology Law Partner',
  'Protecting and monetising intellectual property for technology companies, startups, and creative businesses across the EU.',
  'Sophie Laurent is a Belgian intellectual property attorney with 16 years of experience in EU trademark and patent law, technology licensing, and digital copyright. She advises technology companies, creative agencies, and universities on IP strategy, portfolio management, and licensing agreements. She holds a master''s degree in European IP law and is admitted to the Brussels Bar.',
  'Brussels', 'BE', 'seasoned_professional',
  true, NOW() - INTERVAL '65 days', false,
  (SELECT id FROM services WHERE slug = 'intellectual-property' LIMIT 1),
  16, 350, 1000,
  'active', CURRENT_DATE - INTERVAL '130 days', CURRENT_DATE + INTERVAL '235 days',
  'https://linkedin.com/in/sophie-laurent-ip',
  'https://laurentip.eu',
  '[{"company":"Laurent IP Law","title":"Partner Fondatrice","from":"2018","to":"present","description":"Droit des marques, brevets et propriété intellectuelle pour les entreprises tech"},{"company":"Linklaters Brussels","title":"Counsel — IP & Technology","from":"2011","to":"2018","description":"EU trademark and patent strategy"}]',
  '[{"institution":"Université Libre de Bruxelles","degree":"LLM European IP Law","year":"2009"},{"institution":"KU Leuven","degree":"LLB Law","year":"2007"}]',
  '[{"name":"Avocat au Barreau de Bruxelles","issuer":"Barreau de Bruxelles","year":"2010"},{"name":"European Trade Mark Attorney","issuer":"EUIPO","year":"2013"}]'
),

-- 40. Michael Osei — Dispute Resolution, Ghana (budding)
(
  'e0230040-0000-0000-0000-000000000000',
  'd0230040-0000-0000-0000-000000000000',
  'michael-osei',
  'Commercial Dispute Resolution Advocate',
  'Representing businesses in commercial disputes, arbitration proceedings, and mediation in Ghana and across West Africa.',
  'Michael Osei is a Ghanaian commercial litigator with 5 years of experience representing businesses in High Court commercial disputes, ICC arbitration, and GICAD arbitration proceedings. He has a growing practice in construction disputes, banking litigation, and contract enforcement in Ghana''s court system.',
  'Kumasi', 'GH', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'dispute-resolution' LIMIT 1),
  5, 60, 200,
  'active', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '320 days',
  'https://linkedin.com/in/michael-osei-disputes',
  NULL,
  '[{"company":"Osei Law Chambers","title":"Founder & Principal Advocate","from":"2022","to":"present","description":"Commercial litigation and arbitration in Ghana"},{"company":"Sam Okudzeto & Associates","title":"Associate Lawyer","from":"2019","to":"2022","description":"Commercial and civil litigation"}]',
  '[{"institution":"Ghana School of Law","degree":"BL","year":"2019"},{"institution":"University of Cape Coast","degree":"LLB","year":"2018"}]',
  '[{"name":"Barrister and Solicitor","issuer":"Ghana Bar Association","year":"2019"}]'
),

-- 41. Fatima Malik — Employment Law, Pakistan (budding)
(
  'e0230041-0000-0000-0000-000000000000',
  'd0230041-0000-0000-0000-000000000000',
  'fatima-malik',
  'Employment & HR Law Consultant',
  'Helping Pakistani employers draft employment contracts, manage disciplinary processes, and comply with the Factories Act and EOBI regulations.',
  'Fatima Malik is a Pakistani employment lawyer with 4 years of experience advising employers across manufacturing, IT, and services sectors on workforce law compliance. She helps companies draft employment agreements, handle disputes before the National Industrial Relations Commission, and navigate EOBI and SESSI contribution requirements.',
  'Lahore', 'PK', 'budding_entrepreneur',
  false, NULL, false,
  (SELECT id FROM services WHERE slug = 'employment-law' LIMIT 1),
  4, 30, 100,
  'active', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE + INTERVAL '330 days',
  'https://linkedin.com/in/fatima-malik-employment-pk',
  NULL,
  '[{"company":"Malik Employment Law","title":"Founder","from":"2023","to":"present","description":"Employment law compliance for Pakistani employers"},{"company":"Khalid Anwar & Co Advocates","title":"Junior Associate","from":"2020","to":"2023","description":"Civil and labour law practice"}]',
  '[{"institution":"University of the Punjab Law College","degree":"LLB","year":"2020"}]',
  '[{"name":"Advocate High Court","issuer":"Punjab Bar Council","year":"2020"}]'
),

-- 42. James Kiplangat — Contract Drafting, Kenya (seasoned, verified)
(
  'e0230042-0000-0000-0000-000000000000',
  'd0230042-0000-0000-0000-000000000000',
  'james-kiplangat',
  'Senior Commercial & Contracts Lawyer',
  'Drafting, reviewing, and negotiating commercial contracts for Kenyan businesses, international investors, and regional development projects.',
  'James Kiplangat is a senior commercial lawyer with 14 years of experience in Kenya and across East Africa, specialising in project contracts, procurement agreements, supply chain contracts, and joint venture documentation. He has advised on major infrastructure projects, energy transactions, and technology partnerships across the EAC and has served as legal counsel to development finance institutions.',
  'Nairobi', 'KE', 'seasoned_professional',
  true, NOW() - INTERVAL '60 days', false,
  (SELECT id FROM services WHERE slug = 'contract-drafting' LIMIT 1),
  14, 150, 500,
  'active', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '245 days',
  'https://linkedin.com/in/james-kiplangat-law',
  'https://kiplangatlegal.co.ke',
  '[{"company":"Kiplangat Legal Advocates","title":"Principal Partner","from":"2018","to":"present","description":"Commercial contracts and project documentation for East African businesses"},{"company":"Coulson Harney (Bowmans Kenya)","title":"Senior Associate","from":"2012","to":"2018","description":"Corporate and commercial law, project finance"}]',
  '[{"institution":"University of Nairobi School of Law","degree":"LLM","year":"2012"},{"institution":"Moi University","degree":"LLB","year":"2009"}]',
  '[{"name":"Advocate of the High Court of Kenya","issuer":"Law Society of Kenya","year":"2010"},{"name":"Arbitrator (FCIArb)","issuer":"Chartered Institute of Arbitrators","year":"2016"}]'
),

-- 43. Ana Sousa — Real Estate Law, Portugal (seasoned, verified)
(
  'e0230043-0000-0000-0000-000000000000',
  'd0230043-0000-0000-0000-000000000000',
  'ana-sousa',
  'Partner — Real Estate & Property Law',
  'Advising international investors, developers, and families on Portuguese property acquisition, Golden Visa applications, and real estate transactions.',
  'Ana Sousa is a Portuguese real estate lawyer with 16 years of experience advising international clients on property investment in Portugal, including Golden Visa applications, NHR tax regime, and commercial and residential property transactions. She has guided over 300 international buyers through the Portuguese property acquisition process and has deep expertise in off-plan sales, build contracts, and urban planning law.',
  'Lisbon', 'PT', 'seasoned_professional',
  true, NOW() - INTERVAL '70 days', false,
  (SELECT id FROM services WHERE slug = 'real-estate-law' LIMIT 1),
  16, 250, 800,
  'active', CURRENT_DATE - INTERVAL '140 days', CURRENT_DATE + INTERVAL '225 days',
  'https://linkedin.com/in/ana-sousa-realestate-pt',
  'https://sousapropertylaw.pt',
  '[{"company":"Sousa Property Law","title":"Sócia Fundadora","from":"2019","to":"present","description":"Direito imobiliário para investidores internacionais em Portugal"},{"company":"PLMJ Advogados","title":"Associada Sénior — Imobiliário","from":"2012","to":"2019","description":"Transações imobiliárias comerciais e residenciais"}]',
  '[{"institution":"Universidade de Lisboa Faculdade de Direito","degree":"Mestrado em Direito Civil","year":"2009"},{"institution":"Universidade Católica Portuguesa","degree":"Licenciatura em Direito","year":"2007"}]',
  '[{"name":"Advogada — Ordem dos Advogados de Portugal","issuer":"OAP","year":"2010"}]'
),

-- 44. Viktor Andersen — Intellectual Property, Denmark (seasoned, verified)
(
  'e0230044-0000-0000-0000-000000000000',
  'd0230044-0000-0000-0000-000000000000',
  'viktor-andersen',
  'IP Strategy & Patent Law Director',
  'Helping Danish and Scandinavian technology, life sciences, and design companies protect and commercialise their intellectual property.',
  'Viktor Andersen is a Danish IP attorney with 17 years of experience in patent prosecution, trademark strategy, and technology licensing across Scandinavia and Europe. He has built IP portfolios for several Danish unicorns and advises life sciences and cleantech companies on freedom-to-operate, patent infringement, and cross-border licensing structures. He is a European Patent Attorney.',
  'Copenhagen', 'DK', 'seasoned_professional',
  true, NOW() - INTERVAL '80 days', false,
  (SELECT id FROM services WHERE slug = 'intellectual-property' LIMIT 1),
  17, 400, 1200,
  'active', CURRENT_DATE - INTERVAL '160 days', CURRENT_DATE + INTERVAL '205 days',
  'https://linkedin.com/in/viktor-andersen-ip',
  'https://andersen-ip.dk',
  '[{"company":"Andersen IP Attorneys","title":"Managing Director","from":"2018","to":"present","description":"IP strategy, patent prosecution, and technology licensing in Scandinavia"},{"company":"Horten Advokater","title":"Partner — IP","from":"2012","to":"2018","description":"IP and technology law for Danish technology companies"}]',
  '[{"institution":"University of Copenhagen","degree":"LLM European IP Law","year":"2007"},{"institution":"Technical University of Denmark","degree":"MSc Biotechnology","year":"2005"}]',
  '[{"name":"European Patent Attorney (EPA)","issuer":"EPO","year":"2010"},{"name":"Danish Bar Member","issuer":"Danish Bar and Law Society","year":"2009"}]'
),

-- 45. Preethi Rajan — Dispute Resolution, India (seasoned, verified)
(
  'e0230045-0000-0000-0000-000000000000',
  'd0230045-0000-0000-0000-000000000000',
  'preethi-rajan',
  'Senior Advocate — Commercial & Arbitration',
  'Representing corporates and financial institutions in complex commercial disputes, domestic and international arbitrations, and NCLT insolvency proceedings.',
  'Preethi Rajan is a Chennai-based Senior Advocate with 17 years of experience in commercial dispute resolution. She has appeared before the Supreme Court, High Courts, and arbitral tribunals in over 200 matters spanning contract disputes, banking litigation, IP infringement, and IBC insolvency proceedings. She is a member of the SIAC Panel of Arbitrators and regularly advises boards on litigation risk management.',
  'Chennai', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '90 days', false,
  (SELECT id FROM services WHERE slug = 'dispute-resolution' LIMIT 1),
  17, 200, 800,
  'active', CURRENT_DATE - INTERVAL '175 days', CURRENT_DATE + INTERVAL '190 days',
  'https://linkedin.com/in/preethi-rajan-advocate',
  'https://preethirajan.in',
  '[{"company":"Preethi Rajan Advocates","title":"Senior Advocate & Principal","from":"2016","to":"present","description":"Commercial litigation, arbitration, and insolvency proceedings"},{"company":"Madras High Court","title":"Advocate","from":"2008","to":"2016","description":"Commercial and civil litigation"}]',
  '[{"institution":"Tamil Nadu Dr. Ambedkar Law University","degree":"LLM","year":"2008"},{"institution":"Symbiosis Law School","degree":"LLB","year":"2007"}]',
  '[{"name":"Senior Advocate","issuer":"Madras High Court","year":"2020"},{"name":"SIAC Panel Arbitrator","issuer":"SIAC","year":"2018"}]'
);

-- ─── Step 3: Member Services ──────────────────────────────────────────────────

INSERT INTO member_services (member_id, service_id, is_primary) VALUES
-- Oliver Bennett: Corporate Tax (primary), M&A Tax, Transfer Pricing
('e0230001-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),true),
('e0230001-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='ma-tax' LIMIT 1),false),
('e0230001-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='transfer-pricing' LIMIT 1),false),
-- Mei Nakamura: Transfer Pricing (primary), International Tax
('e0230002-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='transfer-pricing' LIMIT 1),true),
('e0230002-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='international-tax' LIMIT 1),false),
-- Ananya Krishnan: International Tax (primary), Corporate Tax, Transfer Pricing
('e0230003-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='international-tax' LIMIT 1),true),
('e0230003-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),false),
('e0230003-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='transfer-pricing' LIMIT 1),false),
-- Hassan Al-Farsi: International Tax (primary), Corporate Tax, VAT Advisory
('e0230004-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='international-tax' LIMIT 1),true),
('e0230004-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),false),
('e0230004-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),false),
-- Samuel Kofi: M&A Tax (primary), Corporate Tax
('e0230005-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='ma-tax' LIMIT 1),true),
('e0230005-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),false),
-- Elena Voronova: Tax Litigation (primary), Corporate Tax
('e0230006-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='tax-litigation' LIMIT 1),true),
('e0230006-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),false),
-- David Park: Tax Compliances (primary)
('e0230007-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='tax-compliances' LIMIT 1),true),
-- Aditya Malhotra: Estate & Succession (primary), Corporate Tax
('e0230008-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='estate-succession' LIMIT 1),true),
('e0230008-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),false),
-- Priya Venkatesh: GST Advisory (primary), GST Compliance, GST Litigation
('e0230009-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='gst-advisory' LIMIT 1),true),
('e0230009-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='gst-compliance' LIMIT 1),false),
('e0230009-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='gst-litigation' LIMIT 1),false),
-- Rahul Kapoor: GST Compliance (primary), GST Advisory
('e0230010-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='gst-compliance' LIMIT 1),true),
('e0230010-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='gst-advisory' LIMIT 1),false),
-- Fatima Al-Mutairi: VAT Advisory (primary), Customs & Trade
('e0230011-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),true),
('e0230011-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='customs-trade' LIMIT 1),false),
-- Tariq Mahmood: VAT Advisory (primary)
('e0230012-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),true),
-- Emma Thompson: Customs & Trade (primary), VAT Advisory
('e0230013-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='customs-trade' LIMIT 1),true),
('e0230013-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),false),
-- Pierre Dubois: VAT Advisory (primary), Customs & Trade
('e0230014-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),true),
('e0230014-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='customs-trade' LIMIT 1),false),
-- Carlos Santos: Virtual CFO (primary), Financial Reporting, Management Accounts
('e0230015-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),true),
('e0230015-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),false),
('e0230015-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='management-accounts' LIMIT 1),false),
-- Yuki Tanaka: Financial Reporting (primary), Statutory Audit
('e0230016-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),true),
('e0230016-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),false),
-- Amara Diallo: Bookkeeping (primary), Management Accounts
('e0230017-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='bookkeeping' LIMIT 1),true),
('e0230017-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='management-accounts' LIMIT 1),false),
-- Grace Kim: Management Accounts (primary), Virtual CFO, Financial Reporting
('e0230018-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='management-accounts' LIMIT 1),true),
('e0230018-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),false),
('e0230018-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),false),
-- Simon De Beer: Virtual CFO (primary), Financial Reporting, Due Diligence
('e0230019-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),true),
('e0230019-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),false),
('e0230019-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),false),
-- Nadia Hassan: Financial Reporting (primary), Statutory Audit
('e0230020-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),true),
('e0230020-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),false),
-- Patrick O'Reilly: Payroll (primary)
('e0230021-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='payroll' LIMIT 1),true),
-- Andrew Fitzgerald: Due Diligence (primary), Statutory Audit
('e0230022-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),true),
('e0230022-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),false),
-- Olumide Adeleke: Statutory Audit (primary), Internal Audit
('e0230023-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),true),
('e0230023-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),false),
-- Ingeborg Larsen: Internal Audit (primary), Due Diligence
('e0230024-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),true),
('e0230024-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),false),
-- Li Wei: Forensic Audit (primary), Internal Audit
('e0230025-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='forensic-audit' LIMIT 1),true),
('e0230025-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),false),
-- Kavya Nair: Internal Audit (primary)
('e0230026-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),true),
-- Rami Al-Sayed: Due Diligence (primary), Statutory Audit
('e0230027-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),true),
('e0230027-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),false),
-- Marcus Adeyemi: M&A Advisory (primary), Due Diligence, Corporate Governance
('e0230028-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),true),
('e0230028-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),false),
('e0230028-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),false),
-- Soo-Jin Park: Securities Law (primary), Regulatory Compliance, M&A Advisory
('e0230029-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='securities-law' LIMIT 1),true),
('e0230029-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),false),
('e0230029-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),false),
-- Rebecca McAllister: Corporate Governance (primary), Company Incorporation
('e0230030-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),true),
('e0230030-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),false),
-- Lorenzo Ferrari: Company Incorporation (primary), Corporate Governance, Regulatory Compliance
('e0230031-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),true),
('e0230031-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),false),
('e0230031-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),false),
-- Zara Ahmed: Regulatory Compliance (primary), Corporate Governance
('e0230032-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),true),
('e0230032-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),false),
-- Hugo Leclerc: M&A Advisory (primary), Due Diligence
('e0230033-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),true),
('e0230033-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),false),
-- Chen Wei: Securities Law (primary), Regulatory Compliance
('e0230034-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='securities-law' LIMIT 1),true),
('e0230034-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),false),
-- Priyanka Sinha: Corporate Governance (primary), Company Incorporation, Regulatory Compliance
('e0230035-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),true),
('e0230035-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),false),
('e0230035-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),false),
-- Tariq Osman: Company Incorporation (primary)
('e0230036-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),true),
-- Pilar Morales: Contract Drafting (primary), Intellectual Property
('e0230037-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),true),
('e0230037-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),false),
-- Kwame Asante: Employment Law (primary), Dispute Resolution
('e0230038-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='employment-law' LIMIT 1),true),
('e0230038-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),false),
-- Sophie Laurent: Intellectual Property (primary), Contract Drafting
('e0230039-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),true),
('e0230039-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),false),
-- Michael Osei: Dispute Resolution (primary)
('e0230040-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),true),
-- Fatima Malik: Employment Law (primary)
('e0230041-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='employment-law' LIMIT 1),true),
-- James Kiplangat: Contract Drafting (primary), Dispute Resolution
('e0230042-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),true),
('e0230042-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),false),
-- Ana Sousa: Real Estate Law (primary), Contract Drafting
('e0230043-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='real-estate-law' LIMIT 1),true),
('e0230043-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),false),
-- Viktor Andersen: Intellectual Property (primary), Contract Drafting
('e0230044-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),true),
('e0230044-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),false),
-- Preethi Rajan: Dispute Resolution (primary), Employment Law
('e0230045-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),true),
('e0230045-0000-0000-0000-000000000000',(SELECT id FROM services WHERE slug='employment-law' LIMIT 1),false);

-- ─── Step 4: Articles (55 total) ─────────────────────────────────────────────

INSERT INTO articles (
  id, author_id, title, slug, excerpt, body,
  featured_image_url, cover_image_url,
  read_time, read_time_minutes, word_count,
  status, published_at,
  category_id, service_id, tags
) VALUES

-- ── Direct Tax articles (1–10) ─────────────────────────────────────────────

-- 1. Oliver Bennett — UK Corporate Tax Planning for Scale-Ups
(
  'f0230001-0000-0000-0000-000000000000',
  'e0230001-0000-0000-0000-000000000000',
  'UK Corporate Tax Planning for Scale-Ups: What Your Accountant May Not Be Telling You',
  'uk-corporate-tax-planning-scale-ups',
  'As a UK scale-up grows from £5m to £50m in revenue, its tax profile changes dramatically. Here are the planning opportunities that most general accountants miss.',
  '<h2>The Scale-Up Tax Inflection Point</h2><p>Between £5m and £50m in annual revenue, a UK company''s tax position changes fundamentally. VAT becomes a cash flow weapon rather than just an admin burden. R&D tax credits can fund your next product sprint. And the corporate tax rate — now 25% for profits above £250,000 — makes planning a genuine value creator, not just a compliance exercise.</p><h2>R&D Tax Credits: The Most Under-Claimed Relief in the UK</h2><p>The merged R&D scheme, effective from April 2024, combines the previous SME and RDEC regimes. The headline credit rate is 20% of qualifying expenditure, giving a net benefit of around 15p per pound of qualifying spend after tax. Technology companies, engineering firms, and even some professional services businesses routinely miss six-figure claims because their accountants do not specialise in R&D.</p><h2>Patent Box: Your 10% Tax Rate on IP Income</h2><p>If your business holds patents — including software patents in some circumstances — the Patent Box regime allows you to apply an effective 10% corporation tax rate to profits attributable to those patents. For a scale-up generating £2m of IP-derived profit, that is a saving of £300,000 per year versus the full 25% rate.</p><h2>Group Structure and Transfer Pricing</h2><p>As you add international operations, the pricing of services and products between group companies becomes a compliance issue. HMRC expects arm''s length pricing from the moment a group structure is created, not just when you hit a certain revenue threshold. Getting this wrong creates retrospective exposure — get specialist advice before you set up your first overseas subsidiary.</p><h2>The Timing of Deductions</h2><p>Accelerated capital allowances, including full expensing introduced in April 2023, allow immediate 100% deduction for qualifying plant and machinery investment. For a scale-up investing heavily in equipment, servers, or manufacturing plant, this can materially reduce the tax charge in the year of investment and improve cash flow significantly.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1350,
  'published', NOW() - INTERVAL '25 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),
  ARRAY['corporate-tax','UK','R&D-credits','patent-box','scale-up']
),

-- 2. Oliver Bennett — HMRC Enquiries: What to Do When the Letter Arrives
(
  'f0230002-0000-0000-0000-000000000000',
  'e0230001-0000-0000-0000-000000000000',
  'HMRC Enquiries: What to Do in the First 30 Days',
  'hmrc-enquiry-first-30-days',
  'Receiving an HMRC enquiry notice is stressful — but how you respond in the first month can define whether the enquiry closes quickly or escalates into a full investigation.',
  '<h2>Don''t Panic, But Do Act Quickly</h2><p>An HMRC enquiry notice is not a finding of wrongdoing — it is an opening of a review process. HMRC opens over 300,000 enquiries per year, many of which close within months with no adjustment. What matters is how professionally and promptly you respond. The worst thing you can do is ignore the letter or respond without professional advice.</p><h2>Understand the Type of Enquiry</h2><p>HMRC distinguishes between aspect enquiries (focused on a specific line item in your return), full enquiries (a comprehensive review of your return), and Code of Practice 8 and 9 investigations (for suspected serious avoidance or fraud). The type of enquiry determines its scope, the likely timeline, and the professional help you need.</p><h2>Instruct a Specialist Immediately</h2><p>Your general accountant may handle compliance well, but HMRC tax enquiry work is a specialist skill. A tax investigations specialist understands what HMRC is actually looking for, how to frame responses strategically, and when to negotiate versus when to push back. Instructing one in the first two weeks can save months of unnecessary investigation.</p><h2>Gather and Preserve Documentation</h2><p>Begin collating the documentation that supports your return: bank statements, invoices, payroll records, and any third-party evidence. HMRC will request this, and being able to produce it promptly and in an organised manner projects competence and reduces suspicion. Document gaps also need to be identified early so you can explain them coherently.</p><h2>Consider Voluntary Disclosure</h2><p>If you know your return contains errors, voluntary disclosure under HMRC''s Contractual Disclosure Facility (CDF) significantly reduces penalties. Penalties for prompted disclosure (after an enquiry opens) are higher than for unprompted disclosure. If you have concerns about your filing position, discuss voluntary disclosure with your adviser before responding to HMRC.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  6, 6, 1200,
  'published', NOW() - INTERVAL '10 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='tax-litigation' LIMIT 1),
  ARRAY['HMRC','tax-enquiry','investigation','corporate-tax','UK']
),

-- 3. Mei Nakamura — Transfer Pricing in Japan: What Foreign Companies Get Wrong
(
  'f0230003-0000-0000-0000-000000000000',
  'e0230002-0000-0000-0000-000000000000',
  'Transfer Pricing in Japan: The Five Mistakes Foreign Companies Consistently Make',
  'transfer-pricing-japan-common-mistakes',
  'Japan''s National Tax Agency is one of the world''s most active transfer pricing audit authorities. Foreign multinationals operating in Japan consistently make the same five documentation and pricing mistakes that expose them to costly adjustments.',
  '<h2>Japan''s Transfer Pricing Environment</h2><p>The Japanese NTA conducts some of the most rigorous transfer pricing examinations of any tax authority globally. Large case units dedicated to TP audits examine Japan''s largest foreign-invested companies on a rolling basis. With potential adjustments reaching billions of yen and double taxation disputes lasting years, getting your TP house in order in Japan is not optional.</p><h2>Mistake 1: Treating Japan as a Routine Distributor</h2><p>Many foreign multinationals characterise their Japanese subsidiaries as "limited risk distributors" entitled to a modest routine margin. But if your Japanese subsidiary performs valuable sales, marketing, and customer relationship functions — as most do — the NTA will recharacterise it as a "full-fledged distributor" and challenge the low profitability. Document the actual functions performed carefully.</p><h2>Mistake 2: Using Non-Japanese Comparables</h2><p>The NTA expects transfer pricing documentation to use Japanese comparable companies wherever possible. Using European or US database searches when a Japanese database search would produce results is a major red flag that signals your documentation was not prepared with Japan in mind.</p><h2>Mistake 3: Ignoring the APA Option</h2><p>Japan has an excellent Advance Pricing Agreement programme that provides certainty on pricing methodology for three to five years. The NTA is open to bilateral APAs with treaty partners including the US, UK, and Germany. APA costs are front-loaded but provide enormous certainty and audit protection — yet most companies do not consider them until after an audit begins.</p><h2>Mistake 4: Annual Documentation Without Updates</h2><p>Japanese TP regulations require annual documentation. Submitting the same document year after year with minor date changes signals to auditors that your documentation is not seriously maintained. Update your functional analysis and benchmarking annually, especially after business model changes.</p><h2>Mistake 5: Ignoring Local File Thresholds</h2><p>Japan''s Local File requirement applies to controlled transactions exceeding ¥5 billion per year with any single related party. Many companies are surprised to discover they cross this threshold and have been non-compliant. Prepare your Local File proactively — the penalty for non-preparation is substantial.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  8, 8, 1500,
  'published', NOW() - INTERVAL '18 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='transfer-pricing' LIMIT 1),
  ARRAY['transfer-pricing','Japan','NTA','compliance','multinationals']
),

-- 4. Ananya Krishnan — India FDI Tax: Structuring Your Investment
(
  'f0230004-0000-0000-0000-000000000000',
  'e0230003-0000-0000-0000-000000000000',
  'Structuring FDI into India: Tax Considerations Every Foreign Investor Must Know',
  'fdi-india-tax-structuring-guide',
  'India remains one of the world''s most attractive FDI destinations — but the tax implications of how you structure your investment can make or break your returns. Here is what every foreign investor needs to know.',
  '<h2>Why Structure Matters More in India</h2><p>India''s tax treaty network, withholding tax rates, and capital gains regime create a complex web of considerations for foreign investors. The choice of entry vehicle — branch, liaison office, wholly-owned subsidiary, or joint venture — has profound implications for ongoing tax costs, repatriation, and eventual exit. Getting this wrong at the entry stage is costly to fix later.</p><h2>Equity vs. Debt: Thin Capitalisation and GAAR</h2><p>India''s thin capitalisation rules limit the deductibility of interest paid to associated enterprises where the debt-to-equity ratio exceeds 1:1. Additionally, India''s General Anti-Avoidance Rule (GAAR) gives the tax authority broad powers to disregard arrangements that lack commercial substance. Investors planning to fund Indian subsidiaries with related-party debt must model these constraints carefully.</p><h2>Treaty Shopping and Principal Purpose Test</h2><p>India''s tax treaties have been substantially revised following BEPS action point 6. The Mauritius and Singapore treaty routes, once heavily used for capital gains planning, now include a Principal Purpose Test that allows the Indian Revenue to deny treaty benefits where the principal purpose of an arrangement is to obtain those benefits. Substance is now essential.</p><h2>Repatriation Planning: Dividends vs. Buyback</h2><p>India abolished dividend distribution tax in 2020, moving to a shareholder-level taxation model. Dividends are now subject to withholding tax at treaty rates (typically 10–15%). Share buybacks, however, attract a flat 20% buyback tax at the company level, making dividend repatriation generally more efficient for most treaty country investors. Model both routes carefully for your specific investor base.</p><h2>Exit and Capital Gains</h2><p>Gains from the sale of shares in an Indian company are generally subject to Indian capital gains tax. Listed shares held for more than 12 months qualify for long-term capital gains at 10% on gains exceeding ₹1 lakh. Unlisted shares attract 20% with indexation or 10% without. Treaty exemptions are increasingly scrutinised — ensure your holding structure has genuine commercial substance.</p>',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  9, 9, 1650,
  'published', NOW() - INTERVAL '12 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='international-tax' LIMIT 1),
  ARRAY['India','FDI','international-tax','treaty','GAAR']
),

-- 5. Ananya Krishnan — India Tax Treaties After MLI
(
  'f0230005-0000-0000-0000-000000000000',
  'e0230003-0000-0000-0000-000000000000',
  'India''s Tax Treaties After the MLI: What Changed and What Still Works',
  'india-tax-treaties-after-mli',
  'The Multilateral Instrument (MLI) has fundamentally changed how India''s tax treaties operate. Many planning structures that worked in 2015 are no longer viable. Here is a practical guide to what changed.',
  '<h2>The MLI at a Glance</h2><p>India signed the OECD''s Multilateral Instrument in 2017, and it entered into force for most of India''s major tax treaties by 2020. The MLI modifies treaty provisions to implement BEPS minimum standards and optional provisions, without requiring bilateral renegotiation of each treaty. The result is a complex overlay that requires careful analysis of each treaty to understand its current state.</p><h2>Principal Purpose Test: The Big Change</h2><p>The most significant MLI provision for India is Article 7, which introduces the Principal Purpose Test (PPT). Under the PPT, treaty benefits can be denied if it is reasonable to conclude that obtaining the treaty benefit was one of the principal purposes of an arrangement. This applies regardless of whether the arrangement is otherwise within the literal terms of the treaty.</p><h2>Permanent Establishment Rules</h2><p>The MLI also tightened permanent establishment (PE) rules. Activities previously considered "preparatory or auxiliary" — and therefore not creating a PE — are now subject to an anti-fragmentation rule. A foreign company with multiple Indian activities, none of which individually constitutes a PE, may now have a PE if those activities together are not preparatory or auxiliary.</p><h2>What Still Works</h2><p>Genuine business substance remains protected. Companies with real management, employees, decision-making, and commercial activity in their holding jurisdictions can still access treaty benefits. The key is contemporaneous documentation of that substance — not a reactive exercise when GAAR is invoked. The Singapore and Netherlands treaties, for example, remain accessible to investors with genuine Singapore or Dutch operations.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '5 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='international-tax' LIMIT 1),
  ARRAY['India','MLI','tax-treaties','BEPS','PPT']
),

-- 6. Hassan Al-Farsi — UAE Corporate Tax: Year One Lessons
(
  'f0230006-0000-0000-0000-000000000000',
  'e0230004-0000-0000-0000-000000000000',
  'UAE Corporate Tax: Lessons from Year One of Implementation',
  'uae-corporate-tax-year-one-lessons',
  'The UAE''s 9% corporate tax has now completed its first full year. Here are the practical lessons from helping businesses navigate registration, grouping elections, and their first tax return.',
  '<h2>A Year of Learning</h2><p>The UAE Federal Corporate Tax (CT) came into force for most businesses from June 2023. The Federal Tax Authority (FTA) has been active in issuing guidance notes, public clarifications, and cabinet decisions — but the pace of guidance has sometimes lagged the questions that businesses need answered. Here is what we have learned in helping clients navigate the first year.</p><h2>Tax Group Registration: More Nuanced Than Expected</h2><p>Many UAE holding groups rushed to register as Tax Groups, expecting automatic benefit from consolidated filing. But the Tax Group rules require careful analysis: not all UAE entities qualify, and electing into a Tax Group before understanding the implications (particularly around loss utilisation and transfer pricing simplifications) can create unexpected complications. Assess the fit carefully before registering.</p><h2>Free Zone Entities: The Qualifying Income Test</h2><p>Free Zone Persons (FZPs) that meet the Qualifying Free Zone Person (QFZP) criteria can access a 0% CT rate on Qualifying Income. But "Qualifying Income" has a specific definition — it includes income from transactions with other FZPs and foreign-sourced income, but income from UAE mainland customers is generally taxable at 9%. Many free zone businesses have found their income profile is more mixed than they assumed.</p><h2>Transfer Pricing Is Now Real</h2><p>UAE CT introduced arm''s length transfer pricing requirements. For businesses that had never had to think about transfer pricing before — because there was no corporate tax — this is a significant new compliance obligation. Businesses with related party transactions must now maintain documentation and can face adjustments if pricing is not at arm''s length.</p><h2>What to Do Before Your First Return</h2><p>Review your entity structure against the Tax Group and QFZP criteria. Document your transfer pricing positions. Ensure your accounting records are CT-compliant. And engage a CT specialist now — do not wait for the deadline to understand your obligations.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  7, 7, 1400,
  'published', NOW() - INTERVAL '20 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),
  ARRAY['UAE','corporate-tax','FTA','free-zone','transfer-pricing']
),

-- 7. Samuel Kofi — M&A Tax in West Africa
(
  'f0230007-0000-0000-0000-000000000000',
  'e0230005-0000-0000-0000-000000000000',
  'M&A Tax in West Africa: What Buyers Need to Know Before They Sign',
  'ma-tax-west-africa-guide',
  'Acquisitions in West Africa carry unique tax risks that are often underestimated by foreign buyers. From stamp duties to thin capitalisation rules, here is a practical briefing on what to watch for.',
  '<h2>Tax Due Diligence Is Non-Negotiable</h2><p>In West African M&A transactions, tax due diligence is not a checkbox exercise — it is often where the most significant deal risks are found. Tax assessments in Ghana, Nigeria, and Côte d''Ivoire can arrive years after the relevant transactions, and successor liability is real in most jurisdictions. Understanding what you are inheriting is critical before signing any share purchase agreement.</p><h2>Withholding Tax on the Purchase Price</h2><p>Most West African jurisdictions impose withholding tax on capital gains realised by non-resident sellers. In Ghana, capital gains from the disposal of shares are taxed at 10% for residents and up to 15% for non-residents. Nigeria imposes capital gains tax at 10%. These costs need to be allocated clearly in deal economics — they are often a point of negotiation between buyer and seller.</p><h2>Stamp Duty on Share Transfers</h2><p>Stamp duty applies to share transfer documents in most West African jurisdictions and can be significant for large transactions. In Ghana, stamp duty on share transfers is 0.5% of the consideration. Budget for this in your transaction costs and ensure it is paid promptly — late payment triggers penalties and can affect the validity of the transfer.</p><h2>Debt Push-Down and Thin Capitalisation</h2><p>Financing acquisitions in West Africa with acquisition debt is subject to thin capitalisation rules in Nigeria (2:1 debt-to-equity) and similar rules in Ghana. Interest deductions in excess of these limits are denied. Model the post-acquisition debt structure carefully to ensure deductibility of financing costs before agreeing your financing terms.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  7, 7, 1250,
  'published', NOW() - INTERVAL '14 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='ma-tax' LIMIT 1),
  ARRAY['M&A','West-Africa','Ghana','Nigeria','tax','acquisition']
),

-- 8. Elena Voronova — Tax Dispute Strategy
(
  'f0230008-0000-0000-0000-000000000000',
  'e0230006-0000-0000-0000-000000000000',
  'Tax Dispute Strategy: When to Fight, When to Settle, and When to Disclose',
  'tax-dispute-strategy-fight-settle-disclose',
  'Not all tax disputes are worth fighting. Understanding when to settle, when to litigate, and when proactive disclosure protects you better than defence is the hallmark of experienced tax dispute management.',
  '<h2>The Dispute Management Mindset</h2><p>Tax dispute management is as much art as science. The technical strength of your position matters, but so does the commercial cost of a prolonged dispute, the reputational implications of litigation, and the probability of success in the relevant forum. Good tax dispute strategy starts long before any HMRC or revenue authority contact — it starts with the quality of your original tax position and the documentation that supports it.</p><h2>When to Fight</h2><p>Fighting a tax dispute makes sense when: the legal position is genuinely defensible based on established case law; the amount at stake justifies the professional cost of litigation; there is precedent value beyond your specific case; and the dispute is not primarily one of fact (where evidence quality determines outcome) but of law (where clever argument can win).</p><h2>When to Settle</h2><p>Settlement is often underrated as an outcome. Revenue authorities are generally prepared to settle disputes where liability is uncertain, avoiding costly litigation for both sides. A negotiated settlement offers certainty, ends the disruption of enquiry, and eliminates the risk of a worse outcome at tribunal. The key is knowing your BATNA — best alternative to a negotiated agreement.</p><h2>When Voluntary Disclosure Is Best</h2><p>If you discover a genuine error in your tax filing — particularly one involving offshore income, hidden assets, or incorrect characterisation of transactions — voluntary disclosure before an enquiry opens reduces penalties dramatically. The Liechtenstein Disclosure Facility and similar regimes have been replaced by the Requirement to Correct framework in the UK, but the principle remains: early disclosure reduces exposure.</p><h2>The Cost of a War of Attrition</h2><p>Revenue authorities have one advantage: time. They are funded by the taxpayer and can pursue disputes indefinitely. The commercial cost of a multi-year dispute — management distraction, professional fees, and the uncertainty it creates for lenders and investors — is often underestimated. Factor the total cost of fighting into your dispute strategy, not just the potential tax saving.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  8, 8, 1400,
  'published', NOW() - INTERVAL '22 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='tax-litigation' LIMIT 1),
  ARRAY['tax-disputes','litigation','settlement','voluntary-disclosure','strategy']
),

-- 9. Aditya Malhotra — Family Business Succession Planning
(
  'f0230009-0000-0000-0000-000000000000',
  'e0230008-0000-0000-0000-000000000000',
  'Succession Planning for Indian Family Businesses: The Legal and Tax Blueprint',
  'succession-planning-indian-family-business',
  'Passing a family business to the next generation involves far more than a will. Without a structured succession plan, inheritance disputes, tax inefficiencies, and leadership vacuums can destroy businesses that took decades to build.',
  '<h2>The Stakes Are Higher Than You Think</h2><p>India has over 4.9 million family businesses employing more than 79% of the organised private sector workforce. Yet fewer than 30% have a formal succession plan. The consequences of this gap — family disputes, forced asset sales, and dilutive estate settlements — are well-documented. The good news is that the legal and tax tools to structure a clean succession are well-established.</p><h2>The Family Trust Structure</h2><p>A discretionary family trust, with the patriarch or matriarch as the initial settlor and trustee, and family members as beneficiaries, provides the most flexible and comprehensive succession vehicle for Indian families. Assets transferred to the trust are no longer part of the individual''s taxable estate, trust income is assessable at individual beneficiary rates, and the trust deed can specify governance protocols and distribution rules for generations.</p><h2>Will vs. Trust: Why Both Matter</h2><p>A will is essential but insufficient on its own. Wills are subject to probate, which in Indian courts can take years. Assets in a trust, by contrast, pass to beneficiaries outside the probate process. For operating business assets, a will that transfers shares to a trust — rather than directly to family members — avoids the probate delay that can disrupt business operations during the transition.</p><h2>Minimising Capital Gains on Succession</h2><p>Transfers of assets to lineal descendants in India are generally exempt from capital gains tax under Section 47 of the Income Tax Act. However, planning is required to ensure the asset transfer qualifies: the assets must be genuinely gifted, the recipient must be a lineal descendant (or spouse), and the transfer must not be structured as a sale. Document transfers carefully.</p><h2>Family Constitution: The Governance Layer</h2><p>Beyond the legal structure, a family constitution — a non-binding governance document that sets out family values, decision-making processes, and protocols for handling disputes — is the single most effective tool for preserving family harmony through succession. Families that invest in creating a constitution before a patriarch''s death are significantly less likely to experience destructive disputes.</p>',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  9, 9, 1600,
  'published', NOW() - INTERVAL '8 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='estate-succession' LIMIT 1),
  ARRAY['succession-planning','family-business','India','trust','estate']
),

-- 10. David Park — Korean Corporate Tax Compliance Calendar
(
  'f0230010-0000-0000-0000-000000000000',
  'e0230007-0000-0000-0000-000000000000',
  'Korean Corporate Tax Compliance: The 2025 Filing Calendar for Foreign-Invested Companies',
  'korean-corporate-tax-compliance-calendar-2025',
  'Foreign companies operating in South Korea face a dense calendar of NTS filing obligations. Missing any one can trigger penalties. Here is the definitive 2025 compliance calendar.',
  '<h2>Overview of Korean Corporate Tax</h2><p>South Korea imposes corporate income tax at rates ranging from 9% to 24%, depending on taxable income brackets. The National Tax Service (NTS) administers the regime and has significantly upgraded its e-filing and monitoring capabilities in recent years. Foreign-invested companies are generally subject to the same compliance obligations as domestic companies, with some additional reporting requirements.</p><h2>Key Filing Deadlines (January–June)</h2><p>The corporate tax return for the prior year must be filed by March 31 for companies with a December 31 fiscal year-end — the most common choice for foreign-invested companies. Interim prepayments are due by November 30 based on 50% of the prior year''s tax liability. Withholding tax returns are due monthly by the 10th of the following month, or quarterly for eligible small businesses.</p><h2>Local Tax Obligations</h2><p>In addition to national corporate tax, Korean companies pay local income tax (주민세) at approximately 10% of the corporate tax liability. This is filed separately with the local government authority, not the NTS. First-time filers are often surprised by this obligation, which is separate from the corporate tax return.</p><h2>Transfer Pricing Documentation</h2><p>Korean TP regulations require contemporaneous documentation for controlled transactions exceeding KRW 5 billion with any single related party. This documentation must be prepared by the tax return due date. The NTS has significantly intensified TP audit activity in recent years, particularly for technology and manufacturing companies.</p><h2>Common Penalties to Avoid</h2><p>Failure to file or late filing triggers a penalty of 20% of the tax due, plus interest of 0.022% per day. Failure to prepare TP documentation attracts a penalty of 0.5% of the value of undocumented transactions. Set up proper diary systems and engage a local tax adviser to manage these deadlines proactively.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '30 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='tax-compliances' LIMIT 1),
  ARRAY['Korea','corporate-tax','NTS','compliance','filing']
),

-- ── Indirect Tax articles (11–18) ───────────────────────────────────────────

-- 11. Priya Venkatesh — GST Input Tax Credit: The Hidden Cash Flow Lever
(
  'f0230011-0000-0000-0000-000000000000',
  'e0230009-0000-0000-0000-000000000000',
  'GST Input Tax Credit in India: The Hidden Cash Flow Lever Most CFOs Ignore',
  'gst-input-tax-credit-cash-flow-india',
  'Most Indian businesses treat GST as a compliance burden. But managed well, input tax credit is one of the most powerful cash flow tools available to any CFO.',
  '<h2>The Scale of Unclaimed ITC</h2><p>The Indian GST Council estimates that businesses leave significant amounts of eligible input tax credit unclaimed each year, either through improper matching, missed time limits, or simple ignorance. For a manufacturing or trading business with ₹10 crore of annual purchases, an ITC management programme can unlock ₹1.5–2 crore of additional working capital.</p><h2>The GSTR-2B Matching Problem</h2><p>Since the introduction of GSTR-2B (the auto-drafted ITC statement), businesses can only claim ITC reflected in their GSTR-2B — meaning their supplier must have filed and paid their GSTR-1 (outward supplies return) correctly. This creates a supplier dependency problem: your ITC is only as good as your vendors'' GST compliance. Implement supplier compliance checks as part of your procurement process.</p><h2>Blocked Credits: Know What You Cannot Claim</h2><p>Section 17(5) of the CGST Act blocks ITC on a specific list of goods and services, including motor vehicles for personal use, food and beverages, club memberships, and construction for personal use. But "personal use" is defined narrowly — many business uses qualify for ITC that companies mistakenly treat as blocked. Review your blocked credit assumptions with a GST specialist.</p><h2>ITC on Capital Goods: Spread Over Time</h2><p>ITC on capital goods (plant, machinery, and equipment) must be reversed in proportion to exempt supplies made using those assets. For businesses with a mix of taxable and exempt supplies, this creates a complex annual calculation. Model this carefully when making capital investment decisions.</p><h2>Export Refunds: A Persistent Challenge</h2><p>Exporters are entitled to refunds of accumulated ITC on inputs used in zero-rated exports. In practice, GST refund processing in India has improved significantly but remains a challenge for some categories of exporters. Ensuring your refund applications are technically correct and complete dramatically accelerates processing time.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '16 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='gst-advisory' LIMIT 1),
  ARRAY['GST','India','input-tax-credit','cash-flow','ITC']
),

-- 12. Fatima Al-Mutairi — GCC VAT: Common Mistakes in the Financial Sector
(
  'f0230012-0000-0000-0000-000000000000',
  'e0230011-0000-0000-0000-000000000000',
  'GCC VAT and Financial Services: The Five Compliance Mistakes That Cost Banks Most',
  'gcc-vat-financial-services-compliance-mistakes',
  'Financial services VAT in the GCC is among the most complex in the world. Here are the five mistakes that consistently result in the largest assessments for banks and insurance companies operating across the region.',
  '<h2>Financial Services and VAT: A Complex Relationship</h2><p>The GCC VAT framework, adopted uniformly across the UAE, Saudi Arabia, Bahrain, and now others, takes a different approach to financial services than European VAT. Core financial services — lending, deposit-taking, and most insurance — are "exempt" (not zero-rated), which means input VAT on costs attributable to those services is generally not recoverable. This partial exemption creates significant complexity.</p><h2>Mistake 1: Incorrect Partial Exemption Calculations</h2><p>Most banks have a mix of taxable and exempt supplies. The partial exemption calculation determines what proportion of residual input VAT (costs not directly attributable to taxable or exempt supplies) is recoverable. Using a simple income-based apportionment often understates recoverable VAT. A more sophisticated method, agreed with the relevant tax authority, can significantly improve recoverable input VAT.</p><h2>Mistake 2: Treating Fee-Based Services as Exempt</h2><p>Many banks incorrectly treat all income as VAT-exempt. Fees charged for advisory services, arrangement fees, and some custodial services are taxable at 5%, not exempt. Failing to charge VAT on taxable fee income creates an under-declaration — not an over-declaration — which carries penalties for underpayment.</p><h2>Mistake 3: Cross-Border Service Rules</h2><p>The place of supply rules for cross-border financial services in the GCC are complex and not always aligned across member states. A service supplied to a corporate customer outside the GCC may be zero-rated — but only if the service itself meets the relevant criteria and the customer documentation is correct. Many banks over-charge VAT on cross-border services and under-charge on domestic ones.</p><h2>Mistake 4: Insurance: Exempt vs. Taxable</h2><p>Life insurance and health insurance products are generally VAT-exempt in the GCC. General insurance (property, motor, and commercial) is taxable at 5%. Many insurers have product lines that span both categories and have incorrectly classified products. A comprehensive review of insurance product VAT treatment is essential.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '19 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),
  ARRAY['GCC','VAT','financial-services','banking','compliance']
),

-- 13. Emma Thompson — UK Customs Post-Brexit
(
  'f0230013-0000-0000-0000-000000000000',
  'e0230013-0000-0000-0000-000000000000',
  'UK Customs Four Years On: The Post-Brexit Compliance Issues That Won''t Go Away',
  'uk-customs-post-brexit-compliance',
  'Four years after Brexit, many UK businesses still have not fully resolved their customs compliance challenges. Here are the persistent issues and what to do about them.',
  '<h2>The Customs Compliance Gap</h2><p>Brexit transformed UK customs from a largely invisible back-office function to a front-line business challenge. In the rush to adapt in 2020–2021, many businesses implemented workarounds rather than proper systems. Four years on, those workarounds are now creating compliance issues, HMRC audit exposure, and unnecessary duty costs.</p><h2>Rules of Origin: Still the Biggest Problem</h2><p>The UK-EU Trade and Cooperation Agreement (TCA) allows tariff-free trade on goods that meet the relevant rules of origin. But "rules of origin" is not a passive concept — you must demonstrate that your goods qualify, with appropriate documentation. Many UK exporters are either losing duty relief they are entitled to or, worse, falsely claiming preferences they cannot substantiate.</p><h2>Customs Valuation: Getting It Right</h2><p>HMRC audits routinely find customs valuation errors. The customs value of goods is not simply the commercial invoice price — it includes adjustments for royalties, assists (materials supplied free of charge), and related-party pricing. Companies importing from group companies often under-value goods because they use intercompany transfer prices rather than customs-adjusted values.</p><h2>CHIEF to CDS: The System Migration</h2><p>The UK completed the migration from the legacy CHIEFS customs system to the new Customs Declaration Service (CDS) in November 2023. Companies that managed their own declarations under CHIEFS needed to re-register for CDS and learn a new format. Many still have data quality issues in their CDS declarations that are silently creating compliance risk.</p><h2>Excise Duty Suspension and Duty Deferment</h2><p>UK businesses that hold Excise Warehouse Approvals or duty deferment accounts must ensure these are properly maintained. Post-Brexit, the authorisations and guarantee levels that were adequate before 2021 may no longer be correct given changed trade volumes. A customs compliance health check should include a review of all authorisations.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1350,
  'published', NOW() - INTERVAL '11 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='customs-trade' LIMIT 1),
  ARRAY['UK','customs','Brexit','rules-of-origin','HMRC']
),

-- 14. Pierre Dubois — EU VAT OSS for Digital Services
(
  'f0230014-0000-0000-0000-000000000000',
  'e0230014-0000-0000-0000-000000000000',
  'EU One Stop Shop (OSS): What Every Digital Services Business Must Know',
  'eu-vat-oss-digital-services-guide',
  'The EU''s One Stop Shop (OSS) regime simplified VAT compliance for businesses selling digital services across EU member states. But "simplified" is relative — here is what you need to know to use it correctly.',
  '<h2>The Problem OSS Was Designed to Solve</h2><p>Before the OSS regime launched in July 2021, a business selling digital services (software, streaming, online courses) to consumers in 27 EU member states had to register for VAT in every country where sales exceeded the relevant distance selling threshold. This created an administrative nightmare for growing e-commerce and SaaS businesses. OSS was designed to solve this by allowing a single registration in one EU country to cover all EU-wide sales.</p><h2>Who Can Use OSS and for What</h2><p>The Union OSS scheme is available to EU-established businesses for intra-EU distance sales of goods and B2C supplies of services. The Non-Union OSS scheme allows non-EU businesses (including UK businesses post-Brexit) to account for VAT on all B2C digital service supplies made to EU consumers. Supplies covered include electronically supplied services, telecommunications services, and broadcasting services.</p><h2>The Destination Country Rate Problem</h2><p>OSS does not create a single VAT rate — it just simplifies the reporting. Businesses must still charge VAT at the rate applicable in each customer''s country. A streaming service must charge 25% VAT to Swedish customers, 22% to Italian customers, and 20% to French customers. Maintaining accurate geo-location data and applying the correct rate is the principal ongoing challenge.</p><h2>OSS and Marketplaces: A Different Rule</h2><p>If you sell through a marketplace like Amazon or Etsy, the marketplace is deemed to have supplied the goods to the customer (not you). The marketplace is responsible for charging and accounting for VAT. This simplifies things for small sellers but requires care when you also sell direct — your obligations are different across channels.</p><h2>Quarterly Filing and Payment</h2><p>OSS returns are filed quarterly, by the last day of the month following the end of each quarter. Payment is due simultaneously. Unlike national VAT, there is no input VAT deduction in the OSS return — input VAT claims must still be made via the country of registration or the EU VAT Refund portal. This is frequently misunderstood and leads to under-recovery of input tax.</p>',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  8, 8, 1450,
  'published', NOW() - INTERVAL '6 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='vat-advisory' LIMIT 1),
  ARRAY['EU','VAT','OSS','digital-services','e-commerce']
),

-- 15. Rahul Kapoor — GST E-Invoicing for SMEs
(
  'f0230015-0000-0000-0000-000000000000',
  'e0230010-0000-0000-0000-000000000000',
  'GST E-Invoicing in India: A Practical Guide for SMEs',
  'gst-e-invoicing-india-sme-guide',
  'India''s mandatory GST e-invoicing requirement now covers businesses with turnover above ₹5 crore. Here is what SMEs need to do to comply before their first audit.',
  '<h2>What Is GST E-Invoicing?</h2><p>GST e-invoicing is not simply generating an invoice electronically. It is a government mandate that requires businesses above a specified turnover threshold to upload B2B invoice data to the GST Invoice Registration Portal (IRP) before issuing the invoice to the buyer. The IRP generates a unique Invoice Reference Number (IRN) and a QR code that must appear on the physical invoice.</p><h2>Current Threshold and Rollout</h2><p>As of August 2023, e-invoicing is mandatory for all businesses with aggregate annual turnover exceeding ₹5 crore in any previous financial year. The government has indicated the threshold will be progressively reduced, so businesses just below the current threshold should prepare their systems now. Non-compliance results in the invoice being treated as invalid for ITC purposes by the recipient.</p><h2>Setting Up Your ERP or Billing System</h2><p>The practical challenge for most SMEs is integrating their existing billing software (Tally, Zoho, or custom systems) with the IRP API. Most modern accounting software now supports direct IRP integration. If yours does not, consider switching to a GST-compliant platform or using a third-party e-invoice service provider. Manual uploads are permitted but create significant operational risk at volume.</p><h2>Common Compliance Pitfalls</h2><p>The most frequent e-invoicing errors include: wrong GSTIN for the recipient, incorrect HSN codes, mismatch between invoice date and IRP upload date, and failure to cancel invalid IRNs within the 24-hour window. Each creates reconciliation problems that cascade into ITC mismatches in the buyer''s GSTR-2B. Train your accounts team and set up systematic validation checks.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  5, 5, 900,
  'published', NOW() - INTERVAL '28 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='gst-compliance' LIMIT 1),
  ARRAY['GST','India','e-invoicing','SME','compliance']
),

-- ── Accounting articles (16–24) ─────────────────────────────────────────────

-- 16. Carlos Santos — When a Brazilian Startup Needs a Virtual CFO
(
  'f0230016-0000-0000-0000-000000000000',
  'e0230015-0000-0000-0000-000000000000',
  'The Brazilian Startup CFO Gap: When You Need One and What to Look For',
  'brazilian-startup-virtual-cfo-guide',
  'Brazil''s startup ecosystem is maturing rapidly, but the CFO gap — the period when a company has outgrown founder finance but cannot afford a full-time CFO — is particularly acute in Brazil''s complex regulatory environment.',
  '<h2>Brazil''s Unique Finance Complexity</h2><p>Running a Brazilian startup is operationally more complex than almost any other market. The Simples Nacional tax regime, SPED fiscal bookkeeping obligations, eSocial payroll reporting, nota fiscal requirements, and BACEN foreign exchange regulations create a compliance burden that can consume enormous management bandwidth. A Virtual CFO who understands this environment is not a luxury — it is a survival tool for founders.</p><h2>The Revenue Milestone for vCFO Engagement</h2><p>For Brazilian companies, the typical trigger for Virtual CFO engagement is around R$3–5 million in annual revenue or the point at which the company is preparing for an investment round. At this stage, investor-grade financial reporting, clean accounting, and a coherent financial model are non-negotiable. Trying to prepare for a Series A without a professional finance lead is a common and costly mistake.</p><h2>What a Good Brazilian vCFO Does in Year One</h2><p>In the first 12 months, a Virtual CFO should: restructure the chart of accounts for management and investor reporting; implement a monthly close process; build a rolling 13-week cash flow forecast; convert Lucro Real or Simples financials into IFRS or US GAAP for investor consumption; prepare a 3-year financial model; and manage the data room for fundraising.</p><h2>The Tax Regime Question</h2><p>One of the most impactful decisions a Brazilian startup makes is its tax regime election: Simples Nacional (simplified), Lucro Presumido (presumed profit), or Lucro Real (actual profit). The optimal choice depends on the company''s margin structure, payroll costs, and growth trajectory. A Virtual CFO with Brazilian tax expertise can model the cash impact of each regime and make a recommendation.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '21 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),
  ARRAY['Brazil','virtual-CFO','startups','finance','fundraising']
),

-- 17. Carlos Santos — Cash Flow Management
(
  'f0230017-0000-0000-0000-000000000000',
  'e0230015-0000-0000-0000-000000000000',
  'Cash Flow Management: The Silent Killer of Profitable Businesses',
  'cash-flow-management-profitable-businesses',
  'Profitable on paper, broke in practice. Cash flow mismanagement is the leading cause of business failure among companies that are genuinely growing. Here is how a CFO mindset fixes it.',
  '<h2>The Profit vs. Cash Illusion</h2><p>A company can be profitable — showing a healthy net income on its P&L — while simultaneously running out of cash to pay its suppliers and employees. This is not a paradox; it is accounting. Profit is an accrual concept; cash is real. The difference between the two is working capital: the timing mismatch between when you earn revenue and when you collect it, and between when you incur costs and when you pay them.</p><h2>The 13-Week Cash Flow Forecast</h2><p>Every company should maintain a rolling 13-week cash flow forecast. This is a week-by-week projection of actual cash inflows (invoice collections, loan drawdowns, equity receipts) and cash outflows (supplier payments, payroll, rent, tax), yielding a projected cash balance for each week. Unlike the P&L, this forecast shows you exactly when you will hit a cash crunch — typically 4–8 weeks before it happens, giving you time to act.</p><h2>Debtor Days: Your Most Powerful Lever</h2><p>For most B2B businesses, reducing debtor days — the average time it takes customers to pay — is the single highest-impact working capital improvement available. Moving from 60 to 45 debtor days on R$10 million of annual revenue releases R$417,000 of immediate cash. Invoice factoring, early payment discounts, and automated payment reminders are all proven tools.</p><h2>The Covenant Trap</h2><p>Companies with bank facilities often have financial covenants — minimum EBITDA, maximum leverage, or minimum liquidity ratios. A company that is growing fast may inadvertently breach a covenant not because it is in trouble, but because its balance sheet looks different at a given measurement date than the covenant was designed for. Monitor your covenant headroom monthly, not just at reporting dates.</p>',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  7, 7, 1250,
  'published', NOW() - INTERVAL '9 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),
  ARRAY['cash-flow','working-capital','CFO','finance','forecasting']
),

-- 18. Yuki Tanaka — IFRS 17 for Japanese Insurers
(
  'f0230018-0000-0000-0000-000000000000',
  'e0230016-0000-0000-0000-000000000000',
  'IFRS 17 for Japanese Insurers: The Reporting Revolution One Year In',
  'ifrs17-japanese-insurers-year-one',
  'IFRS 17 was one of the most technically complex accounting standards ever issued. For Japan''s life insurance sector, which adopted it in 2024, the first full year of reporting has been a journey. Here is what worked, what did not, and what CFOs should focus on for year two.',
  '<h2>Why IFRS 17 Was Difficult for Japanese Life Insurers</h2><p>Japan''s life insurance market has unique characteristics that made IFRS 17 implementation particularly challenging: long-duration contracts (40–50 year policies are common), guaranteed returns from the pre-2000 era when Japanese interest rates were higher, and a long history of accounting under Japanese GAAP which treats insurance contracts very differently from IFRS. The adjustments required were among the most significant accounting changes Japanese insurers had ever undertaken.</p><h2>Contractual Service Margin: The New Profit Metric</h2><p>The Contractual Service Margin (CSM) is the central new concept in IFRS 17 — it represents the unearned profit in an insurance contract, recognised over the coverage period. For investors and analysts accustomed to Japanese GAAP, the CSM creates a fundamentally different picture of profitability and capital adequacy. CFOs and IR teams needed to invest heavily in investor education in the first year.</p><h2>Discount Rates: The Key Judgment</h2><p>IFRS 17 requires insurance liabilities to be discounted at market-consistent rates. Japanese insurers face a particular challenge: many legacy portfolios carry guaranteed rates from a high-interest-rate era, and the current low-rate environment creates discount rate assumptions that are sensitive to small parameter changes. Audit committees must understand the sensitivity of reported results to discount rate assumptions.</p><h2>Year Two Priorities</h2><p>For year two, the priorities are: refining the actuarial models used to estimate the CSM; improving the quality of comparative period disclosures; and developing analyst-friendly supplementary metrics that bridge IFRS 17 outcomes to the business performance metrics the market actually uses. CFOs who invest in clear financial communication will differentiate their companies in equity markets.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  8, 8, 1400,
  'published', NOW() - INTERVAL '15 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),
  ARRAY['IFRS-17','Japan','insurance','accounting','financial-reporting']
),

-- 19. Simon De Beer — Raising Capital in South Africa
(
  'f0230019-0000-0000-0000-000000000000',
  'e0230019-0000-0000-0000-000000000000',
  'Raising Capital in South Africa: What Your Investor Wants to See in Your Data Room',
  'raising-capital-south-africa-investor-data-room',
  'South African investors — from development finance institutions to venture capital firms — want the same things from a data room as any global investor. Here is what to have ready before your first meeting.',
  '<h2>The South African Capital Market Reality</h2><p>South Africa has a sophisticated capital market ecosystem, but the pool of available equity capital for growth companies is relatively concentrated. DFIs like the IDC, DBSA, and SEFA are active in earlier stages. The VC ecosystem — centred around firms like Knife Capital, Naspers Foundry, and HAVAIC — is growing but selective. Angel investing through platforms like SA Angel Investment Network is increasingly active. Understanding which capital source is appropriate for your stage is the first step.</p><h2>Financial Model: What Investors Actually Review</h2><p>Investors spend more time on the financial model than almost any other document. They are looking for: coherent unit economics (CAC, LTV, churn for SaaS; gross margin and inventory turns for product businesses); a realistic three-year P&L that connects to the business narrative; a cash flow model that shows how and when the investment will be deployed; and sensitivity analysis showing how the business performs under downside scenarios.</p><h2>SARS Compliance: A Dealbreaker Issue</h2><p>South African investors will scrutinise your tax compliance status early in due diligence. A tax clearance certificate with SARS is not optional — it is table stakes. Outstanding PAYE, VAT, and income tax obligations create contingent liabilities that investors either price into their offer or use as a reason to walk. Resolve any SARS compliance issues before entering a fundraising process.</p><h2>BBBEE Structure</h2><p>Broad-Based Black Economic Empowerment (BBBEE) ownership and management structure is a consideration for many capital sources, particularly DFIs which have specific BBBEE requirements. Ensure your current ownership structure is accurately documented and that you understand how different capital structures will affect your BBBEE rating.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1250,
  'published', NOW() - INTERVAL '23 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='virtual-cfo' LIMIT 1),
  ARRAY['South-Africa','fundraising','venture-capital','data-room','investor']
),

-- 20. Grace Kim — Management Accounts: What They Tell You
(
  'f0230020-0000-0000-0000-000000000000',
  'e0230018-0000-0000-0000-000000000000',
  'Management Accounts: What They Tell You — and What They Don''t',
  'management-accounts-what-they-tell-you',
  'Monthly management accounts are the most important financial document a business produces — yet they are routinely misunderstood, ignored, or produced too late to be useful. Here is how to make yours matter.',
  '<h2>Why Most Management Accounts Fail</h2><p>The typical management accounts package fails for one of three reasons: it arrives too late (day 20 or later after month-end, by which point decisions have already been made); it reports what happened rather than why it happened; or it drowns readers in data without making the key messages clear. Great management accounts are a communication tool, not just a financial statement.</p><h2>The Five Numbers That Matter</h2><p>For most businesses, five numbers drive 80% of the insight: revenue vs. budget (and vs. prior year); gross margin percentage; EBITDA vs. budget; cash position and movement; and debtor/creditor days. These five metrics tell you whether the business is performing, why it is performing that way, and whether it is generating or consuming cash. Build your management pack around these.</p><h2>Variances: The Story Behind the Numbers</h2><p>A management pack that shows revenue was 10% below budget but provides no explanation is almost useless. The explanatory commentary — which should come from the business unit leader, not just the finance team — is where decisions are made. Institutionalise the practice of variance commentary: who is responsible for producing it, by when, and to what standard.</p><h2>Non-Financial KPIs</h2><p>Financial outcomes are lagging indicators — they tell you what happened. Leading indicators — customer acquisition cost, sales pipeline value, employee NPS, product defect rate, delivery times — tell you what is likely to happen. The best management packs integrate financial and non-financial KPIs into a coherent picture of business health.</p><h2>Board Pack vs. Management Pack</h2><p>A management accounts pack and a board pack are different documents with different audiences. Management accounts are detailed and operational — for the CEO, CFO, and management team. A board pack is strategic and summarised — for non-executive directors who need to understand direction, not details. Producing one and sending it to both audiences serves neither well.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  6, 6, 1200,
  'published', NOW() - INTERVAL '13 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='management-accounts' LIMIT 1),
  ARRAY['management-accounts','CFO','FP&A','board-pack','financial-reporting']
),

-- 21. Nadia Hassan — IFRS 9 Credit Impairment for Egyptian Banks
(
  'f0230021-0000-0000-0000-000000000000',
  'e0230020-0000-0000-0000-000000000000',
  'IFRS 9 Credit Impairment: What Egyptian Banks Are Still Getting Wrong',
  'ifrs9-credit-impairment-egyptian-banks',
  'IFRS 9''s expected credit loss model has been in force for years, yet many Egyptian banks'' provisioning models remain too mechanical and too backward-looking. Here is what better practice looks like.',
  '<h2>The Shift from Incurred to Expected Credit Loss</h2><p>IFRS 9 replaced the IAS 39 "incurred loss" model with an "expected credit loss" (ECL) approach. Under IAS 39, provisions were recognised only when a loss event had occurred. Under IFRS 9, provisions must reflect expected future losses — including macroeconomic forward-looking information — from the moment a loan is originated. This fundamentally changes how banks think about credit risk.</p><h2>The Three-Stage Model in Practice</h2><p>IFRS 9 requires banks to classify exposures into three stages based on changes in credit risk since origination. Stage 1 (no significant increase in risk): 12-month ECL. Stage 2 (significant increase in risk): lifetime ECL. Stage 3 (credit-impaired): lifetime ECL with interest on net carrying amount. The Stage 2 threshold is the single most judgement-intensive decision in the ECL model.</p><h2>Macroeconomic Scenarios for Egypt</h2><p>Egyptian banks must incorporate forward-looking macroeconomic scenarios into their ECL models. In an environment of currency volatility, import constraints, and inflationary pressure — all features of the Egyptian economy in recent years — the selection and weighting of macroeconomic scenarios has a material impact on provisioning levels. Supervisors expect banks to justify their scenario selection with documented economic analysis.</p><h2>Model Validation: A Regulatory Expectation</h2><p>The Egyptian Financial Regulatory Authority expects banks to independently validate their ECL models annually. Independent validation means testing conducted by someone not involved in model development — typically an internal model validation team or external specialists. Banks that cannot demonstrate independent validation face supervisory challenge of their provisioning levels.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  7, 7, 1250,
  'published', NOW() - INTERVAL '17 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='financial-reporting' LIMIT 1),
  ARRAY['IFRS-9','Egypt','banking','credit-risk','provisioning']
),

-- 22. Amara Diallo — Cloud Bookkeeping for West African SMEs
(
  'f0230022-0000-0000-0000-000000000000',
  'e0230017-0000-0000-0000-000000000000',
  'Moving to Cloud Bookkeeping in West Africa: A Practical Migration Guide',
  'cloud-bookkeeping-west-africa-migration-guide',
  'Switching from manual ledgers to cloud accounting software is one of the best investments a West African SME can make. Here is how to do it without disrupting your business.',
  '<h2>Why Cloud Bookkeeping Makes Sense in West Africa</h2><p>Cloud accounting software — Xero, QuickBooks Online, and Wave being the most popular — offers West African SMEs capabilities that previously required expensive enterprise systems. Real-time visibility of financial position, automatic bank reconciliation, multi-currency support for cross-border businesses, and anytime access for remote accountants make cloud bookkeeping transformational for businesses that were previously working from spreadsheets or manual ledgers.</p><h2>Choosing the Right Platform</h2><p>The right choice depends on your business size and complexity. For very small businesses (under 10 employees, simple transactions), Wave is free and adequate. QuickBooks Online is best for businesses that need payroll integration and strong inventory management. Xero is the strongest choice for businesses with complex multi-currency requirements, multiple users, or that want to give accountants real-time access. All three have mobile apps suitable for West African connectivity conditions.</p><h2>The Migration Process</h2><p>A successful migration involves five steps: setting up your chart of accounts (the categories your transactions will be allocated to); importing or entering your opening balances (what you owe and are owed on day one); connecting your bank feeds (so transactions import automatically); migrating historical data (at least the current financial year); and training your team. Do not try to do all this while also running your month-end close — plan a transition window.</p><h2>Common Mistakes</h2><p>The most common mistake is importing transactions without a consistent chart of accounts, creating a mess that is harder to fix than starting fresh. The second most common is failing to reconcile the opening balance sheet — if your cloud system does not agree with your prior records from day one, every subsequent month will be wrong. Take the time to reconcile properly before going live.</p>',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  5, 5, 950,
  'published', NOW() - INTERVAL '27 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='bookkeeping' LIMIT 1),
  ARRAY['bookkeeping','West-Africa','cloud-accounting','Xero','QuickBooks']
),

-- ── Audit articles (23–28) ──────────────────────────────────────────────────

-- 23. Andrew Fitzgerald — Due Diligence Red Flags
(
  'f0230023-0000-0000-0000-000000000000',
  'e0230022-0000-0000-0000-000000000000',
  'Due Diligence Red Flags: The Warning Signs That Should Make You Pause a Deal',
  'due-diligence-red-flags-deal-warning-signs',
  'After completing over 120 transactions, these are the due diligence findings that most consistently predict post-acquisition problems — and what they should mean for your deal process.',
  '<h2>The Due Diligence Mindset</h2><p>Due diligence is not just a legal and financial verification exercise — it is intelligence gathering. The goal is not to confirm that everything is fine (a buyer bias that leads to confirmation errors), but to surface the things that are not fine and decide whether they are dealbreakers, price adjusters, or simply manageable risks. The best due diligence teams approach every data room with scepticism and rigour.</p><h2>Red Flag 1: Revenue Concentration</h2><p>When more than 30% of a target''s revenue comes from a single customer — and particularly when that customer relationship has no long-term contract — the business faces binary risk. The loss of that customer can destroy the investment thesis overnight. Examine customer contracts, renewal history, and the relationship''s health independently of management''s optimism.</p><h2>Red Flag 2: Working Capital Manipulation</h2><p>Working capital is the most commonly manipulated financial metric in M&A. Sellers have every incentive to maximise working capital at the measurement date: collecting receivables early, delaying supplier payments, and building inventory. A working capital analysis that looks only at the measurement date misses seasonal patterns and deliberate manipulation. Always review 12–24 months of monthly working capital data.</p><h2>Red Flag 3: Management Dependency</h2><p>A business where key customer relationships, technical knowledge, or operational capability sit exclusively with one or two senior individuals is a fragile business. If those individuals are also the sellers — whose incentive to stay post-acquisition diminishes once they receive their consideration — the risk is acute. Assess key person dependency rigorously and structure retention arrangements accordingly.</p><h2>Red Flag 4: IT Systems That Cannot Scale</h2><p>Buyers in technology-heavy sectors are increasingly finding that targets'' IT infrastructure — whether ERP systems, data management, or customer-facing platforms — cannot support the growth trajectory embedded in the deal price. A technical due diligence assessment of IT infrastructure is no longer optional for transactions where systems are critical to the business model.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  8, 8, 1450,
  'published', NOW() - INTERVAL '24 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),
  ARRAY['due-diligence','M&A','red-flags','acquisition','deal']
),

-- 24. Olumide Adeleke — Audit Committee Effectiveness in Nigeria
(
  'f0230024-0000-0000-0000-000000000000',
  'e0230023-0000-0000-0000-000000000000',
  'Audit Committee Effectiveness in Nigerian Listed Companies: What the Best Ones Do Differently',
  'audit-committee-effectiveness-nigeria',
  'The audit committee is the most important governance body a listed Nigerian company has. Yet the effectiveness gap between the best and worst audit committees is enormous. Here is what separates them.',
  '<h2>The Regulatory Framework</h2><p>The Securities and Exchange Commission (SEC) Nigeria and the Nigerian Exchange Group (NGX) require listed companies to maintain audit committees composed of at least six members — three shareholder representatives and three independent non-executive directors. The Companies and Allied Matters Act (CAMA) 2020 sets out the statutory obligations of audit committees. But compliance with these requirements is the floor, not the ceiling, of effectiveness.</p><h2>What Great Audit Committees Do</h2><p>The best audit committees in Nigerian listed companies share several characteristics: they meet more frequently than the minimum required (typically four to six times annually, not twice); they have substantive pre-meeting briefings with the external auditor and internal audit team without management present; they challenge management on accounting judgements rather than passively approving them; and they maintain a forward-looking agenda, not just a backwards-looking one.</p><h2>The External Auditor Relationship</h2><p>An audit committee that simply approves the external auditor''s findings without probing them is missing a critical governance function. Great audit committees ask: what were the key audit matters and why? What adjustments did management propose and reject? What is the auditor''s view of the quality of management''s accounting judgements in areas of estimation uncertainty? This dialogue protects shareholders and catches problems early.</p><h2>Internal Audit: A Strategic Asset</h2><p>Many Nigerian companies treat internal audit as a compliance function that produces reports management ignores. Effective audit committees direct internal audit''s work agenda based on the risk landscape, receive direct reporting from the Chief Audit Executive, and ensure recommendations are tracked to implementation. Internal audit that reports dotted-line to the CFO rather than directly to the audit committee is structurally compromised.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '20 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),
  ARRAY['audit-committee','Nigeria','corporate-governance','listed-companies','internal-audit']
),

-- 25. Ingeborg Larsen — Internal Audit in Nordic Companies
(
  'f0230025-0000-0000-0000-000000000000',
  'e0230024-0000-0000-0000-000000000000',
  'Internal Audit as a Strategic Business Partner: Lessons from Nordic Oil & Gas',
  'internal-audit-strategic-business-partner-nordic',
  'The best internal audit functions in Nordic energy companies have moved far beyond compliance policing to become genuine strategic partners. Here is how they made that transition.',
  '<h2>The Evolution of Internal Audit</h2><p>Internal audit has evolved through three generations in most large organisations: the compliance police (1980s–1990s), the risk-based auditor (2000s–2010s), and now the strategic business partner (emerging since 2015). In Norwegian and Nordic oil and gas companies — where operational risk has enormous financial and safety consequences — this evolution has been particularly marked.</p><h2>Shifting from Reactive to Predictive</h2><p>Traditional internal audit identifies problems after they have happened. Strategic internal audit functions use data analytics and continuous monitoring to identify emerging risks before they materialise into control failures or losses. Companies like Equinor use internal audit analytics tools that continuously scan transactional data for anomalies — flagging unusual patterns for investigation rather than waiting for the annual audit cycle to catch them.</p><h2>The Stakeholder Management Dimension</h2><p>Strategic internal audit is fundamentally about relationships. Chief Audit Executives who spend time understanding the business units they audit — attending strategy sessions, understanding operational challenges, and building relationships with operational leaders — produce audit findings that are more relevant, more accepted, and more likely to drive genuine improvement.</p><h2>Digital and ESG Audit Capabilities</h2><p>The fastest-growing areas of internal audit in Nordic energy are digital/cyber audit (assessing the risk of IT failures and cyber attacks on operational technology) and ESG/sustainability audit (verifying that sustainability reporting is accurate and that environmental commitments are being met operationally). These are skill gaps in most internal audit functions — close them proactively.</p>',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '26 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),
  ARRAY['internal-audit','Norway','oil-gas','risk','ESG']
),

-- 26. Rami Al-Sayed — Due Diligence in MENA
(
  'f0230026-0000-0000-0000-000000000000',
  'e0230027-0000-0000-0000-000000000000',
  'Financial Due Diligence in MENA: Why Standard Frameworks Break Down and What to Use Instead',
  'financial-due-diligence-mena-framework',
  'Western due diligence frameworks, designed for markets with strong accounting standards and public data, consistently fail when applied to MENA targets. Here is a MENA-specific approach that actually works.',
  '<h2>The Information Challenge in MENA</h2><p>Due diligence in Western markets begins with a comprehensive, audited financial history, detailed management accounts, and a reliable data room. In MENA markets, none of these can be assumed. Audit quality varies enormously across the region — from Big Four quality for major listed companies to minimal oversight for family-owned businesses. Management accounts are often absent or prepared specifically for the transaction. Data rooms frequently omit critical documents. Every MENA due diligence must begin with an honest assessment of information quality.</p><h2>Cash Accounting vs. Accrual: The Hidden Issue</h2><p>Many MENA businesses — particularly SMEs and family-owned companies — maintain accounts on a cash basis rather than an accrual basis. This means revenue is recognised when cash is received and costs when cash is paid, not when the underlying transactions occur. This can create significant distortions in reported earnings, particularly for businesses with long payment cycles. Adjusting historical financials from cash to accrual basis is often the first task in a MENA diligence.</p><h2>Related Party Transactions</h2><p>Related party transactions are endemic in MENA family business structures and require particular scrutiny. Sales to, and purchases from, controlled entities at non-market prices; rental of assets from the family at above-market rates; management fees and interest charges from related parties — these are common mechanisms through which cash is extracted from an operating business prior to sale. A detailed related party map is essential in every MENA transaction.</p><h2>Regulatory and Licensing Risk</h2><p>Many MENA businesses operate under licences, permits, and approvals that are jurisdiction-specific, non-transferable, and potentially revocable. Change of ownership may trigger licence review or renewal requirements. In regulated sectors (healthcare, finance, education, real estate), this can create a critical path risk that must be resolved before transaction close.</p>',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  8, 8, 1450,
  'published', NOW() - INTERVAL '7 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='due-diligence' LIMIT 1),
  ARRAY['MENA','due-diligence','M&A','family-business','Lebanon']
);

-- ── Corporate Law articles (27–38) ──────────────────────────────────────────

INSERT INTO articles (
  id, author_id, title, slug, excerpt, body,
  featured_image_url, cover_image_url,
  read_time, read_time_minutes, word_count,
  status, published_at,
  category_id, service_id, tags
) VALUES

-- 27. Marcus Adeyemi — M&A in Africa: Regulatory Landscape
(
  'f0230027-0000-0000-0000-000000000000',
  'e0230028-0000-0000-0000-000000000000',
  'M&A in Africa: Navigating the Regulatory Approval Maze',
  'ma-africa-regulatory-approvals-guide',
  'African M&A transactions take twice as long as equivalent deals in Europe — largely because of regulatory approvals. Here is how to plan for them and avoid the traps that kill deals.',
  '<h2>Why African Deals Take Longer</h2><p>A straightforward acquisition that would complete in 3 months in the UK or Germany routinely takes 9–18 months across multiple African markets. The primary culprits are: competition authority review timelines, foreign investment approval processes, sector-specific licensing requirements, and central bank approvals for financial sector transactions. Understanding the regulatory path before signing a term sheet is essential.</p><h2>Competition Law: A New Frontier</h2><p>Competition law is maturing rapidly across Africa. Nigeria, Kenya, South Africa, Ghana, and Egypt all have active competition authorities with mandatory merger notification requirements. The African Continental Free Trade Area (AfCFTA) is expected to eventually create a pan-African competition framework. Deal teams must now map all competition filings required at the start of every multi-jurisdiction transaction.</p><h2>Foreign Investment Controls</h2><p>Several African jurisdictions restrict foreign ownership in strategic sectors. Nigeria''s banking sector, Kenya''s land ownership rules, and Ethiopia''s telecoms sector all impose ownership restrictions on foreign investors. These restrictions are not always well-publicised — they emerge during due diligence or, worse, during the regulatory approval process. Screen for sector-specific investment restrictions before committing to a deal structure.</p><h2>Central Bank Approvals for Financial Sector M&A</h2><p>Acquisitions involving banks, insurance companies, or payment service providers require central bank approval in virtually every African jurisdiction. These processes are notoriously slow — Nigeria''s CBN and Kenya''s CBK routinely take 6–12 months to process acquisition applications. Build this into your deal timeline and long-stop date from day one.</p><h2>Managing Parallel Regulatory Processes</h2><p>Large pan-African transactions require parallel management of multiple regulatory processes across different jurisdictions. This requires a transaction management office approach: a centralised tracker, designated regulatory leads in each jurisdiction, and regular reporting to the deal steering committee on regulatory progress and emerging issues.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  8, 8, 1450,
  'published', NOW() - INTERVAL '29 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),
  ARRAY['M&A','Africa','regulatory','competition-law','deal']
),

-- 28. Marcus Adeyemi — Africa PE: Creating Value Post-Close
(
  'f0230028-0000-0000-0000-000000000000',
  'e0230028-0000-0000-0000-000000000000',
  'Private Equity in Africa: Creating Value After the Deal Closes',
  'private-equity-africa-value-creation-post-close',
  'Winning a deal in Africa is hard. Creating the value you paid for is harder. Here is a practical value creation framework for PE-backed businesses operating across the continent.',
  '<h2>The Africa PE Value Creation Challenge</h2><p>Private equity in Africa has matured significantly over the past decade, but return profiles remain highly variable. The funds that consistently outperform have one thing in common: they do not rely on multiple expansion or financial leverage to generate returns. They create genuine operational value — professionalising management teams, building finance functions, opening new markets, and improving operational efficiency. This is harder and slower than financial engineering, but it is the only reliable value creation lever in most African markets.</p><h2>The 100-Day Plan: Getting It Right</h2><p>The first 100 days after acquisition close set the tone for the entire holding period. The best PE sponsors use this period to: conduct a deep operational assessment beyond what due diligence revealed; install a management information system that gives the board real-time visibility; establish a clear strategic plan with measurable milestones; and identify the two or three key value creation initiatives that will drive the investment thesis.</p><h2>Finance Function Transformation</h2><p>The majority of African PE-backed companies have finance functions that are not investor-grade. This means: monthly close processes that take 3–4 weeks rather than 5 days; management accounts that lag operational reality; absence of a rolling cash flow forecast; and limited financial analysis capability. Transforming the finance function is typically the single highest-return 100-day investment.</p><h2>Exit Planning from Day One</h2><p>In African PE, exit options are more limited than in developed markets. Trade buyers, regional strategic acquirers, and secondary PE are the main routes. IPO remains possible in a handful of markets (Nigeria, Kenya, South Africa, Egypt) but is the exception rather than the rule. Successful exits require positioning the business for the specific buyer pool available — start this work from day one of ownership, not in year four.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  7, 7, 1350,
  'published', NOW() - INTERVAL '11 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),
  ARRAY['private-equity','Africa','value-creation','operations','portfolio']
),

-- 29. Soo-Jin Park — KOSDAQ IPO Guide for Founders
(
  'f0230029-0000-0000-0000-000000000000',
  'e0230029-0000-0000-0000-000000000000',
  'Listing on KOSDAQ: A Founder''s Guide to Korea''s Tech Stock Exchange',
  'kosdaq-ipo-guide-for-founders',
  'KOSDAQ has produced some of Korea''s most valuable technology companies. But the listing process is significantly different from NYSE or London — here is what founders need to know.',
  '<h2>Why KOSDAQ?</h2><p>KOSDAQ — Korea''s growth stock exchange — has been the home of Korea''s technology success stories, from gaming companies to biotech leaders. Listing on KOSDAQ gives Korean technology companies access to a deep pool of domestic retail and institutional capital, a brand recognition lift with Korean customers and partners, and a currency for acquisitions. For companies with primarily Korean revenue and operations, it often makes more strategic sense than a US or European listing.</p><h2>The KOSDAQ Listing Requirements</h2><p>KOSDAQ has multiple listing pathways. The standard path requires: at minimum KRW 3 billion in equity capital; a track record of operating profit; and a management team with no major criminal or regulatory history. The "growth" pathway, available for innovative technology and bio companies, allows pre-profit companies to list based on technology certification and future growth potential — subject to a technology evaluation by KOSDAQ-designated evaluators.</p><h2>The IPO Timeline</h2><p>A KOSDAQ IPO typically takes 12–18 months from the decision to list to first trading day. Key milestones include: appointment of lead underwriter (typically KDB, NH, or Mirae Asset); IFRS financial audit (at least two years required); FSS preliminary review; KOSDAQ listing committee review; and the offering process itself. Build a realistic timeline that includes buffer for FSS information requests, which are extensive.</p><h2>The Prospectus: What Korean Investors Focus On</h2><p>Korean retail investors dominate KOSDAQ trading, and their analytical approach differs from institutional investors. Korean retail investors focus heavily on relative valuation (PER multiples vs. sector peers), growth trajectory (revenue and profit CAGR), and narrative — the story of the business opportunity. Invest in your investor relations and communications strategy before listing, not after.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '16 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='securities-law' LIMIT 1),
  ARRAY['Korea','KOSDAQ','IPO','securities','listing']
),

-- 30. Rebecca McAllister — UK Corporate Governance Code 2024
(
  'f0230030-0000-0000-0000-000000000000',
  'e0230030-0000-0000-0000-000000000000',
  'The UK Corporate Governance Code 2024: What Boards Must Change Before Year-End',
  'uk-corporate-governance-code-2024-board-changes',
  'The revised UK Corporate Governance Code took effect for financial years commencing on or after 1 January 2025. Boards that have not yet mapped the gap between their current practices and the new requirements are already behind.',
  '<h2>The Most Significant Change: Internal Controls</h2><p>The most impactful change in the 2024 Code is the new Provision 29 requirement for directors to make an annual statement on the effectiveness of material internal controls over financial reporting. This goes significantly further than existing requirements and moves the UK towards a US Sarbanes-Oxley-style approach, without being as prescriptive. The FRC''s guidance is clear: this requires a documented assessment process, not just a statement of directors'' belief.</p><h2>What Provision 29 Requires in Practice</h2><p>Directors must: define what "material controls" means for their business; map the processes and systems that constitute those controls; test or otherwise assess whether those controls are operating effectively; and document the results of that assessment. Where material weaknesses are identified, they must be disclosed. This is a significant operational undertaking, particularly for companies that have relied on external audit as their primary assurance mechanism.</p><h2>Audit and Assurance Policy</h2><p>The 2024 Code introduces a new requirement for boards to publish an audit and assurance policy — a document describing how the board gets assurance over the reliability of financial and non-financial reporting. This policy must be put to shareholders for a vote at least every three years. The FRC expects this to be a substantive document, not boilerplate, that describes the company''s specific assurance approach.</p><h2>Sustainability Reporting Integration</h2><p>The 2024 Code introduces an expectation that sustainability reporting is subject to the same level of board oversight and assurance as financial reporting. For companies subject to TCFD and ISSB requirements, the Audit Committee must now explicitly consider sustainability data quality and assurance. This will require most Audit Committees to develop new expertise or access external expertise in sustainability reporting.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '4 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),
  ARRAY['UK','corporate-governance','FRC','Code-2024','board']
),

-- 31. Lorenzo Ferrari — Company Incorporation in Italy
(
  'f0230031-0000-0000-0000-000000000000',
  'e0230031-0000-0000-0000-000000000000',
  'Setting Up a Company in Italy: The 2025 Legal and Tax Guide for Foreign Investors',
  'company-incorporation-italy-foreign-investors-2025',
  'Italy is the eighth-largest economy in the world and a gateway to EU markets. Setting up the right legal structure in Italy is the foundation of a successful market entry.',
  '<h2>Choosing the Right Legal Structure</h2><p>Foreign companies entering Italy have three main structural options: a branch (sede secondaria), a limited liability company (SRL — Società a Responsabilità Limitata), or a joint stock company (SPA — Società per Azioni). For most market entries, an SRL offers the best balance of flexibility, limited liability, and administrative simplicity. The SPA is typically used when equity capital markets access or a wider shareholder base is anticipated.</p><h2>SRL Incorporation: The Process</h2><p>Incorporating an SRL in Italy requires: a notarial deed of incorporation (executed before an Italian Notaio); filing with the Chamber of Commerce; registration with the Italian Revenue Agency (Agenzia delle Entrate) for a tax code (codice fiscale) and VAT number (Partita IVA); and registration with INPS (social security). The process typically takes 3–6 weeks. The minimum share capital for an SRL is €1, though the Notaio will typically advise a higher amount for commercial credibility.</p><h2>Italy''s Substitute Tax for Foreign Holding Income</h2><p>Italy introduced a flat 7% substitute tax for individuals relocating to certain southern Italian municipalities — an attractive regime for entrepreneurs and executives. More broadly, Italy''s "Flat Tax for New Residents" allows non-residents relocating to Italy to pay a flat €100,000 annual tax on foreign-sourced income, regardless of the actual amount. This has attracted significant interest from international entrepreneurs and investors.</p><h2>Italian Labour Law: What to Know Before Hiring</h2><p>Italian labour law is among the most protective of employees in Europe. Termination of permanent employees is heavily regulated and costly. Most foreign companies entering Italy either start with fixed-term contracts (which have strict limits) or use umbrella employment arrangements before making permanent hires. Seek specialist employment law advice before hiring your first Italian employee.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '21 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),
  ARRAY['Italy','company-incorporation','SRL','EU','market-entry']
),

-- 32. Zara Ahmed — AML/CFT for UAE Fintechs
(
  'f0230032-0000-0000-0000-000000000000',
  'e0230032-0000-0000-0000-000000000000',
  'AML/CFT Compliance for UAE Fintechs: Building a Programme That Survives CBUAE Scrutiny',
  'aml-cft-compliance-uae-fintechs',
  'UAE fintech licensing is increasingly accessible — but AML/CFT compliance is where most applicants stumble. Here is what a CBUAE-ready compliance programme looks like.',
  '<h2>The UAE AML/CFT Landscape</h2><p>The UAE has significantly strengthened its AML/CFT framework following its 2022 FATF grey-listing — and subsequent successful delisting in 2024. The Central Bank of UAE (CBUAE), the DFSA (DIFC), and ADGM Financial Services Regulatory Authority now apply rigorous AML/CFT supervision to licensed financial institutions, including fintechs. The bar for compliance has risen substantially and will not return to where it was.</p><h2>Risk Assessment: The Foundation</h2><p>Every regulated UAE fintech must conduct and maintain a documented Business-Wide Risk Assessment (BWRA) that identifies the money laundering and terrorism financing risks inherent in its products, customers, channels, and geographies. This is not a template exercise — it must reflect the actual risk profile of the business. Regulators can and do request the BWRA during supervisory visits and assess its quality and currency.</p><h2>Customer Due Diligence: Proportionate but Rigorous</h2><p>UAE fintechs must implement risk-based CDD: simplified due diligence for lower-risk customers, enhanced due diligence (EDD) for higher-risk customers including PEPs, high-risk country nationals, and complex ownership structures. Transaction monitoring must be automated and calibrated to the specific risk profile of the customer base. Alert thresholds that are not based on actual risk analysis are a major supervisory concern.</p><h2>Sanctions Screening</h2><p>UAE law requires screening against UN Security Council, UAE Cabinet Decision, OFAC, EU, and UK sanctions lists. This must be real-time screening at onboarding and on an ongoing basis. Fintechs that use free screening tools with poor match rates are routinely criticised in supervisory examinations. Invest in a reputable screening solution.</p><h2>The Compliance Officer Requirement</h2><p>Every CBUAE-licensed entity must have a fit-and-proper Compliance Officer (CO) approved by the regulator. The CO must have relevant qualifications and experience — generic banking experience is no longer sufficient. CAMS certification is a baseline expectation. Ensure your CO has dedicated time for compliance functions and is not also carrying out other operational roles.</p>',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  8, 8, 1500,
  'published', NOW() - INTERVAL '3 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='regulatory-compliance' LIMIT 1),
  ARRAY['UAE','AML','fintech','CBUAE','compliance']
),

-- 33. Priyanka Sinha — SEBI Listing Regulations India
(
  'f0230033-0000-0000-0000-000000000000',
  'e0230035-0000-0000-0000-000000000000',
  'SEBI Listing Obligations: The 10 Compliance Obligations Every Listed Company Must Master',
  'sebi-listing-obligations-compliance-india',
  'For Indian listed companies, SEBI''s Listing Obligations and Disclosure Requirements (LODR) Regulations create a dense web of ongoing compliance obligations. Here are the ten that matter most.',
  '<h2>Overview of LODR</h2><p>SEBI''s LODR Regulations 2015, substantially amended in 2018, 2021, and 2023, govern the continuous disclosure and governance obligations of companies listed on Indian stock exchanges. The regulations are enforced aggressively — SEBI has imposed significant penalties on listed companies and their directors for LODR violations, including penalties for procedural non-compliances that directors often assume are harmless.</p><h2>1. Board Composition and Gender Diversity</h2><p>Every listed company must have at least one-third independent directors on its board, and at least one woman director. For top 500 listed companies by market cap, at least one woman independent director is required. Non-compliance triggers automatic non-compliance reporting by the stock exchange and penalty proceedings by SEBI.</p><h2>2. Audit Committee Composition and Responsibilities</h2><p>The Audit Committee must have a minimum of three directors, two-thirds independent, with at least one having accounting or financial management expertise. The Committee''s responsibilities under LODR are extensive — from reviewing financial statements to approving related party transactions. Non-compliance with Audit Committee requirements is a frequently cited SEBI violation.</p><h2>3. Related Party Transaction Approval</h2><p>All material related party transactions (RPTs) require prior approval of the Audit Committee and, above certain thresholds, shareholder approval. "Material" RPTs involving promoters require approval by non-promoter shareholders. This obligation is one of SEBI''s highest enforcement priorities following high-profile corporate governance failures involving undisclosed RPTs.</p><h2>4. Insider Trading Compliance</h2><p>Listed companies must maintain a structured digital database of all persons with unpublished price sensitive information (UPSI), implement trading windows, pre-clear designated persons'' trades, and report insider trading violations to SEBI. The 2021 amendments significantly tightened enforcement, and SEBI has pursued personal liability against compliance officers for systemic failures.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  7, 7, 1350,
  'published', NOW() - INTERVAL '18 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='corporate-governance' LIMIT 1),
  ARRAY['India','SEBI','LODR','listed-companies','compliance']
),

-- 34. Hugo Leclerc — French Mid-Market M&A Landscape
(
  'f0230034-0000-0000-0000-000000000000',
  'e0230033-0000-0000-0000-000000000000',
  'French Mid-Market M&A in 2025: The Trends Every Buyer and Seller Should Know',
  'french-mid-market-ma-trends-2025',
  'France''s mid-market M&A activity has defied broader European economic headwinds. Here are the themes driving deal flow in 2025 and what they mean for buyers and sellers.',
  '<h2>A Resilient Market Despite Macro Headwinds</h2><p>French mid-market M&A (transactions between €10m and €500m) remained resilient in 2024 despite rising interest rates, geopolitical uncertainty, and a cautious European economic outlook. Deal volume declined roughly 15% from 2022 peaks, but deal quality — and valuations for high-quality assets — remained strong, particularly in healthcare, technology services, and industrial automation.</p><h2>Theme 1: Technology Services and IT Transformation</h2><p>French IT services businesses — particularly those in digital transformation, cybersecurity, and cloud services — attracted the highest valuation multiples and the most competitive processes in 2024. Strategic buyers (large IT groups) and financial buyers (PE funds) competed aggressively for assets with strong recurring revenue, low customer concentration, and growing demand. ESN (Entreprises de Services du Numérique) consolidation is a multi-year structural theme.</p><h2>Theme 2: Healthcare Services Consolidation</h2><p>France''s fragmented healthcare services sector — including dental groups, physiotherapy centres, and specialist medical practices — continued its consolidation journey in 2024. PE-backed platform companies are systematically acquiring regional practices, professionalising management, and investing in IT infrastructure. The sector offers defensive characteristics (regulated revenue, demographic tailwinds) that remain attractive even in an uncertain economic environment.</p><h2>Theme 3: Founder-Owner Exits</h2><p>A significant cohort of post-war generation French business founders — now in their 60s and 70s — are actively seeking exits. These businesses typically have strong local market positions, loyal customer bases, and relatively unsophisticated management infrastructure, making them attractive targets for both strategic buyers wanting a French platform and PE funds planning a build-and-buy strategy.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '14 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='ma-advisory' LIMIT 1),
  ARRAY['France','M&A','mid-market','private-equity','healthcare']
),

-- ── Legal Services articles (35–44) ─────────────────────────────────────────

-- 35. Pilar Morales — SaaS Agreements in Spain and LATAM
(
  'f0230035-0000-0000-0000-000000000000',
  'e0230037-0000-0000-0000-000000000000',
  'SaaS Agreements in Spain and LATAM: The Contract Clauses That Make or Break Your Business',
  'saas-agreements-spain-latam-key-clauses',
  'A SaaS contract is more than a service agreement — it is the legal infrastructure of your business model. These are the clauses that determine whether your agreements protect you or expose you.',
  '<h2>Why Generic SaaS Terms Are Dangerous</h2><p>Many Spanish and Latin American technology companies start their commercial life with generic SaaS terms downloaded from the internet — often from a US-centric template that does not account for Spanish consumer protection law, EU GDPR requirements, or the specific commercial norms of their target markets. As customer relationships grow, these generic terms create gaps that become expensive disputes.</p><h2>Service Level Agreements: Precision Matters</h2><p>An SLA that promises "99.9% uptime" without defining how uptime is measured, how downtime credit is calculated, and what exclusions apply is not a meaningful commitment. Precisely define: the measurement window (calendar month? rolling 30 days?); what counts as downtime (platform unavailable vs. degraded performance?); the credit mechanism (% of monthly fee? actual damages?); and the notification obligations on both sides.</p><h2>Data Ownership and Processing</h2><p>For any SaaS product processing personal data of EU residents, the agreement must include a Data Processing Agreement (DPA) compliant with Article 28 GDPR. This must specify: the nature and purpose of processing; the types of personal data involved; the duration of processing; and the obligations and rights of both data controller (customer) and data processor (you). Operating without a compliant DPA creates significant regulatory exposure under GDPR.</p><h2>Limitation of Liability</h2><p>Your limitation of liability clause is the most negotiated and most important risk management provision in your agreement. A well-drafted clause: caps your total aggregate liability (typically 12 months'' fees); carves out unlimited liability for defined categories (death, personal injury, fraud, wilful misconduct); excludes consequential and indirect losses; and provides mutual protections. Review every enterprise agreement''s limitation clause carefully — some enterprise customers will push back aggressively.</p><h2>Termination and Data Return</h2><p>Define precisely: the notice period and process for termination for convenience (for both parties); the rights of termination for cause, including cure periods; and — critically — the customer''s right to extract their data following termination and your obligation to delete it. Data portability and deletion are not just good contract practice — they are legal obligations under GDPR.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  8, 8, 1500,
  'published', NOW() - INTERVAL '22 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),
  ARRAY['SaaS','contracts','Spain','LATAM','GDPR']
),

-- 36. Kwame Asante — Redundancy Law in Ghana
(
  'f0230036-0000-0000-0000-000000000000',
  'e0230038-0000-0000-0000-000000000000',
  'Managing Redundancies in Ghana: What the Labour Act 651 Requires and How to Get It Right',
  'redundancy-law-ghana-labour-act-guide',
  'Redundancy in Ghana is heavily regulated under the Labour Act 651. Getting the process wrong exposes employers to significant compensation claims and reputational damage. Here is the compliant path.',
  '<h2>What Constitutes a Redundancy Under Ghanaian Law</h2><p>The Labour Act 651 defines redundancy as the termination of an employee''s contract by an employer where the need for the employee''s particular role has ceased or diminished. This encompasses business closure, organisational restructuring, technological change, and economic downturns. Ghanaian courts have interpreted this definition broadly — if a role is eliminated for any business reason rather than performance, it is likely to be treated as a redundancy.</p><h2>Consultation Requirements</h2><p>Before implementing a redundancy, an employer must notify and consult the relevant trade union (if the employees are unionised) and give sufficient notice. The Act does not specify a minimum consultation period, but courts expect genuine consultation, not a fait accompli presented to workers. For businesses with works councils or employee representatives, engage those bodies first. Document the consultation process meticulously.</p><h2>Redundancy Pay Calculation</h2><p>Section 65 of the Labour Act provides that an employee who is made redundant is entitled to a minimum of one month''s pay for each year of service (or pro-rated for a fraction of a year). For long-serving employees, this can be significant. The "pay" base includes basic salary and allowances that form part of regular remuneration — understand the calculation base before you run the numbers.</p><h2>Notice Pay and Final Settlement</h2><p>In addition to redundancy pay, employees are entitled to their contractual notice period (or pay in lieu). Outstanding leave balances must be paid out. Ensure your final settlement calculations are accurate — errors create NLC claims and reputational damage. Obtain a signed settlement agreement wherever possible to confirm full and final settlement of all claims.</p>',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '10 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='employment-law' LIMIT 1),
  ARRAY['Ghana','employment-law','redundancy','Labour-Act','HR']
),

-- 37. Sophie Laurent — EU Trademark Strategy for Tech Startups
(
  'f0230037-0000-0000-0000-000000000000',
  'e0230039-0000-0000-0000-000000000000',
  'EU Trademark Strategy for Tech Startups: Protecting Your Brand Before You Scale',
  'eu-trademark-strategy-tech-startups',
  'A trademark is one of the most valuable assets a technology startup can build. Getting your EU trademark strategy right early costs a fraction of what litigation costs later.',
  '<h2>Why Trademarks Matter More Than Founders Think</h2><p>Most technology founders focus their IP attention on patents and code. But the brand — the name, the logo, the slogan — is often the company''s most commercially valuable intangible asset over a 10-year horizon. A brand that has attracted customer loyalty and market recognition cannot easily be rebuilt if a competitor or trademark troll forces a rebrand. Protecting it early is one of the highest-return legal investments a startup can make.</p><h2>EUTM vs. National Filings</h2><p>The European Union Trade Mark (EUTM) system, administered by the EUIPO in Alicante, allows a single application to cover all 27 EU member states. This makes it dramatically more cost-effective than separate national filings for EU-wide protection. An EUTM application costs approximately €850 for the first class of goods/services — far less than the aggregate cost of 27 national applications. File EUTM before you launch commercially in Europe.</p><h2>Clearance Search: Do It Before You Name Your Company</h2><p>The most expensive trademark mistake is choosing a name, building brand equity, and then discovering that another party holds an identical or confusingly similar earlier mark. A clearance search before naming costs €500–€1,500 and can save hundreds of thousands in rebranding costs and litigation. Search not just identical marks but phonetically and visually similar ones.</p><h2>Class Strategy: Beyond Class 42</h2><p>Technology companies typically default to filing in Class 42 (software services). But depending on your business model, you may also need protection in Class 9 (software products), Class 35 (business and commercial services), Class 38 (telecommunications), or Class 45 (legal and security services). A brand used in commerce without the correct class coverage is partially unprotected.</p>',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '17 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),
  ARRAY['trademark','EU','startup','brand','EUIPO']
),

-- 38. James Kiplangat — Infrastructure Contracts in East Africa
(
  'f0230038-0000-0000-0000-000000000000',
  'e0230042-0000-0000-0000-000000000000',
  'Infrastructure Project Contracts in East Africa: Key Legal Risks and How to Manage Them',
  'infrastructure-contracts-east-africa-legal-risks',
  'Infrastructure transactions in East Africa involve unique legal and commercial risks that standard international contract templates do not adequately address. Here is what experienced practitioners focus on.',
  '<h2>The East African Infrastructure Opportunity</h2><p>East Africa''s infrastructure gap — in roads, power, water, and digital connectivity — represents one of the most significant investment opportunities on the continent. The region''s governments are actively seeking private investment through PPP frameworks, and development finance institutions including the AfDB, IFC, and DFI are providing anchor capital. But the legal risks are real and require careful management.</p><h2>Force Majeure in African Contracts</h2><p>Standard FIDIC and NEC force majeure clauses, designed for developed market contexts, often do not adequately address African-specific force majeure events: foreign exchange unavailability, government actions, and civil unrest. Negotiating a properly tailored force majeure clause that captures events actually likely in the project jurisdiction is essential. Generic clauses leave parties exposed to disputes about whether events qualify.</p><h2>Government Counterparty Risk</h2><p>In many East African infrastructure projects, the contracting authority is a government entity — a ministry, state utility, or municipal authority. Government counterparty risk — the risk that the government will not perform its payment obligations, will exercise regulatory powers adversely, or will change the legal framework — is one of the most significant risks in infrastructure investment. Robust stabilisation clauses and change-in-law protections are essential in government contracts.</p><h2>Dispute Resolution: Why International Arbitration Is Essential</h2><p>Local court systems in most East African jurisdictions, while improving, are not suitable for resolving complex international infrastructure disputes. Enforcement of judgments against government entities is particularly challenging. International arbitration — ICSID for investment disputes involving governments, ICC or LCIA for commercial disputes — provides a faster, more reliable, and internationally enforceable dispute resolution mechanism. Specify it in every significant contract.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '26 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),
  ARRAY['East-Africa','infrastructure','contracts','PPP','arbitration']
),

-- 39. Ana Sousa — Portugal Golden Visa
(
  'f0230039-0000-0000-0000-000000000000',
  'e0230043-0000-0000-0000-000000000000',
  'Portugal''s Golden Visa in 2025: What Still Works After the 2023 Changes',
  'portugal-golden-visa-2025-guide',
  'Portugal''s Golden Visa programme changed significantly in 2023, removing real estate investment as a qualifying route. Here is what still qualifies and how to access EU residency through the programme.',
  '<h2>What Changed in 2023</h2><p>Portugal''s Golden Visa programme, launched in 2012, was amended significantly in October 2023. The most significant change was the removal of residential real estate investment as a qualifying route for new applications. This had been the most popular route — accounting for over 90% of applications — and its removal fundamentally changed the programme''s structure. However, the programme itself survived and continues to offer EU residency to qualifying investors.</p><h2>What Still Qualifies in 2025</h2><p>The current qualifying investment routes include: capital transfer of at least €500,000 for investment in units of investment funds or venture capital funds; €500,000 for scientific research activities; €250,000 for investment in cultural heritage or the arts; and job creation of at least 10 positions. Each route has specific conditions and documentation requirements.</p><h2>The NHR Tax Regime</h2><p>While obtaining a Golden Visa, many investors also seek to take advantage of Portugal''s Non-Habitual Resident (NHR) tax regime, which provides a 20% flat tax on Portuguese-source income from high-value activities and an exemption on most foreign-source income for 10 years. The NHR regime was modified in 2024 — the new IFICI (Incentivo Fiscal à Investigação Científica e Inovação) regime replaced NHR for new applicants, with somewhat different qualifying criteria.</p><h2>The Path to Citizenship</h2><p>Portugal''s Golden Visa offers a uniquely efficient path to EU citizenship. After five years of maintaining the qualifying investment, with minimum stay requirements (seven days in the first year, 14 days in subsequent two-year periods), Golden Visa holders can apply for permanent residency or Portuguese citizenship. Portuguese citizenship carries EU freedom of movement rights across all 27 member states.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '8 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='real-estate-law' LIMIT 1),
  ARRAY['Portugal','Golden-Visa','residency','investment','EU']
),

-- 40. Viktor Andersen — Patent Strategy for Deep Tech
(
  'f0230040-0000-0000-0000-000000000000',
  'e0230044-0000-0000-0000-000000000000',
  'Patent Strategy for Deep Tech Startups: Building a Portfolio That Attracts Investors and Blocks Competitors',
  'patent-strategy-deep-tech-startups',
  'A well-constructed patent portfolio does three things: it protects your core technology, creates licensing revenue streams, and signals technical credibility to investors. Here is how to build one strategically.',
  '<h2>Why Patents Matter for Deep Tech</h2><p>For deep technology companies — those whose competitive advantage rests on genuine technical innovation in areas like AI, biotech, cleantech, or advanced materials — a patent portfolio is a business fundamental, not a legal luxury. Investors in deep tech routinely evaluate IP portfolios as a proxy for technical defensibility. A company without meaningful patent protection in its core technology is vulnerable to competitive copying and struggles to justify premium valuations.</p><h2>Filing Strategy: Broad First, Narrow Later</h2><p>The most common mistake in patent strategy is filing too narrowly. Initial patent claims should be as broad as the prior art will support — protecting the inventive concept, not just one implementation of it. Narrower claims can be added in continuations and divisionals as the technology evolves. Start broad and narrow as necessary during prosecution; the reverse is not possible once claims are filed.</p><h2>The Priority Year: Your Most Valuable Asset</h2><p>The filing of an initial patent application — even a provisional application — establishes a priority date. All subsequent PCT or national phase filings made within 12 months claim that priority date. This means you can test, refine, and iterate your technology for 12 months after the priority filing, without risk to your patent rights, before committing to the more expensive national phase. Use this year strategically.</p><h2>Freedom to Operate: The Often-Missed Assessment</h2><p>Building a patent portfolio is only half the IP strategy. The other half is freedom to operate (FTO) — ensuring that your product or process does not infringe the valid patents of others. Most deep tech startups do not commission FTO opinions early enough and discover blocking patents during due diligence or, worse, after launch. Commission FTO assessments in your core technology areas before significant commercial activity begins.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '13 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),
  ARRAY['patent','deep-tech','IP-strategy','startup','innovation']
),

-- 41. Preethi Rajan — IBC Insolvency in India
(
  'f0230041-0000-0000-0000-000000000000',
  'e0230045-0000-0000-0000-000000000000',
  'The Indian Insolvency and Bankruptcy Code: A Creditor''s Practical Guide to Recovery',
  'india-ibc-insolvency-creditor-guide',
  'The IBC transformed India''s insolvency landscape. For creditors, it provides a powerful recovery tool — but only if used correctly. Here is a practitioner''s guide to maximising recovery under the IBC.',
  '<h2>The IBC Revolution</h2><p>The Insolvency and Bankruptcy Code 2016 transformed India''s approach to corporate insolvency. Before the IBC, creditor recovery in India was notoriously poor — secured creditors recovered an average of 25% of their dues in processes that took 4–5 years. The IBC was designed to achieve better recoveries in shorter timeframes through a time-bound, market-driven resolution process. Recovery rates have improved materially, though the 330-day timeline target is rarely met in complex cases.</p><h2>Triggering CIRP: The Threshold and Process</h2><p>A financial creditor (bank, NCD holder, or debenture trustee) can trigger the Corporate Insolvency Resolution Process (CIRP) by filing an application with the National Company Law Tribunal (NCLT) upon default of at least ₹1 crore. The NCLT must admit or reject the application within 14 days. Upon admission, an Interim Resolution Professional (IRP) is appointed and the debtor''s management is replaced. The CIRP must conclude within 330 days (including litigation).</p><h2>The Committee of Creditors: Your Key Forum</h2><p>Once CIRP commences, financial creditors become members of the Committee of Creditors (CoC) with voting power proportional to their outstanding debt. The CoC approves the Resolution Plan submitted by resolution applicants. CoC decisions require 66% voting share for most decisions and 75% for others. Understanding CoC dynamics — and building coalitions among creditors — is a critical skill in large IBC matters.</p><h2>Resolution vs. Liquidation: The Economic Reality</h2><p>A Resolution Plan must offer value superior to liquidation to be approved by the CoC and NCLT. In practice, resolution values in most IBC cases still fall well short of outstanding debt — financial creditors are recovering 30–50 paise on the rupee in most large resolutions. Operational creditors (suppliers) typically recover even less. Understand the realistic waterfall before committing significant resources to a CIRP.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  8, 8, 1450,
  'published', NOW() - INTERVAL '6 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),
  ARRAY['India','IBC','insolvency','NCLT','creditor']
),

-- 42. Pilar Morales — Franchise Agreements Spain
(
  'f0230042-0000-0000-0000-000000000000',
  'e0230037-0000-0000-0000-000000000000',
  'Franchise Agreements in Spain: Legal Pitfalls That Kill Franchise Systems Before They Scale',
  'franchise-agreements-spain-legal-pitfalls',
  'Spain''s franchise market is one of Europe''s most active. But poorly drafted franchise agreements — and failure to comply with Spain''s pre-contractual disclosure obligations — create legal and commercial crises that destroy franchise systems.',
  '<h2>Spain''s Franchise Legal Framework</h2><p>Franchising in Spain is regulated by Royal Decree 201/2010, which requires franchisors to register with the national Franchise Registry and provide franchisees with a pre-contractual disclosure document (DIP — Documento de Información Precontractual) at least 20 days before signing any binding agreement. Failure to comply with these disclosure obligations gives franchisees the right to rescind the agreement and claim damages. Many franchise systems have been brought down by this seemingly procedural requirement.</p><h2>The Pre-Contractual Disclosure Document</h2><p>The DIP must contain: the franchisor''s identification and corporate details; the network''s financial history for the past three years; a description of the franchise concept and the rights granted; the financial obligations of the franchisee; the term of the agreement and renewal conditions; and any exclusivity granted. The content requirements are specific — a generic DIP will not suffice.</p><h2>Territory Clauses: More Nuanced Than They Appear</h2><p>Exclusive territory grants in Spanish franchise agreements must be drafted carefully to comply with EU competition law. Absolute territorial exclusivity preventing the franchisor from appointing other franchisees in the territory is permissible. Absolute territorial exclusivity preventing passive sales by the franchisee outside the territory is not — it violates Article 101 TFEU. Get this wrong and the exclusivity clause is unenforceable.</p><h2>Exit and Non-Compete</h2><p>Post-termination non-compete clauses in Spanish franchise agreements are enforceable for up to one year (extendable to two years in specific circumstances) and must be geographically and subject-matter limited. Broader restrictions are unenforceable. Draft your non-competes within these parameters from the start — courts will not blue-pencil an over-broad clause but may void it entirely.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '19 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='contract-drafting' LIMIT 1),
  ARRAY['franchise','Spain','contracts','disclosure','EU-competition']
),

-- 43. Ana Sousa — Portuguese Real Estate Legal Due Diligence
(
  'f0230043-0000-0000-0000-000000000000',
  'e0230043-0000-0000-0000-000000000000',
  'Buying Property in Portugal: Legal Due Diligence for International Buyers',
  'buying-property-portugal-legal-due-diligence',
  'International buyers make Portugal one of Europe''s most active residential and commercial property markets. Here is the complete legal due diligence checklist that every buyer needs before signing a Promissory Contract.',
  '<h2>Why Legal Due Diligence in Portugal Is Non-Negotiable</h2><p>Portugal''s property register (Conservatória do Registo Predial) provides the definitive record of property ownership and encumbrances. But it is not always accurate, complete, or up-to-date. Properties can carry undisclosed encumbrances, unresolved planning violations, undisclosed co-ownership rights, or disputed boundaries. A thorough legal due diligence — conducted before signing any binding agreement — identifies these issues before they become your problem.</p><h2>Key Documents to Obtain and Review</h2><p>The essential pre-purchase documents are: the Certidão de Teor (property register extract) showing current ownership and registered encumbrances; the Caderneta Predial (tax registration document) showing the tax-assessed value and official description; the Licença de Habitabilidade (habitation licence) confirming the property is licensed for occupation; the IMI (property tax) payment certificates; and any condominium meeting minutes if the property forms part of a condominium.</p><h2>The CPCV (Promissory Contract)</h2><p>The Contrato Promessa de Compra e Venda (CPCV) is the binding pre-sale agreement that legally commits both parties to the transaction. The standard deposit at CPCV stage is 10–30% of the purchase price. If the seller withdraws, they must return double the deposit. If the buyer withdraws, they forfeit the deposit. Ensure the CPCV includes appropriate conditions precedent — for planning issues, mortgage approval, or survey results — before signing.</p><h2>IMT and Stamp Duty</h2><p>Portuguese property acquisition is subject to Imposto Municipal sobre Transmissões (IMT) — the property transfer tax — at rates ranging from 0% to 7.5% for residential property (higher for urban and commercial property). Stamp duty (Imposto do Selo) of 0.8% applies on the higher of the purchase price and tax-assessed value. These costs must be budgeted before any transaction.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '15 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='real-estate-law' LIMIT 1),
  ARRAY['Portugal','real-estate','due-diligence','property','foreign-investors']
),

-- 44. Michael Osei — Commercial Arbitration in West Africa
(
  'f0230044-0000-0000-0000-000000000000',
  'e0230040-0000-0000-0000-000000000000',
  'Commercial Arbitration in West Africa: Using the GICAD and ACIA Frameworks Effectively',
  'commercial-arbitration-west-africa-gicad-acia',
  'West African commercial parties have more arbitration options than ever before. Here is how to choose between domestic and international arbitration, and how to ensure your awards are enforceable.',
  '<h2>The Growth of Arbitration in West Africa</h2><p>Commercial arbitration in West Africa has grown significantly over the past decade, driven by growing commercial activity, improving legal infrastructure, and increasing awareness of the limitations of local court systems for complex commercial disputes. Ghana''s Arbitration Centre and GICAD (Ghana International Chamber of Arbitration and Dispute Resolution), Nigeria''s ICAMA and the Lagos Court of Arbitration, and OHADA''s CCJA for French-speaking West Africa all provide institutional frameworks for regional commercial dispute resolution.</p><h2>GICAD vs. International Arbitration: When to Choose What</h2><p>For disputes between Ghanaian parties, or where both parties are comfortable with Ghanaian-administered proceedings, GICAD offers cost advantages and familiarity with local commercial law. For disputes involving international parties or significant sums, ICC or LCIA arbitration provides more internationally recognised rules, greater procedural flexibility, and awards that are more straightforwardly enforceable in non-Ghanaian jurisdictions.</p><h2>Drafting an Effective Arbitration Clause</h2><p>The most important arbitration decision you make is often buried in a contract boilerplate: the arbitration clause. Specify precisely: the institutional rules (ICC, LCIA, GICAD); the seat of arbitration (London, Paris, Accra, Lagos); the number of arbitrators (one or three); the language of proceedings; and the governing law of the agreement. An ambiguous or defective arbitration clause can invalidate the entire dispute resolution mechanism.</p><h2>Enforcement of Awards in Ghana</h2><p>Ghana is a signatory to the New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards, meaning foreign awards can be enforced in Ghanaian courts. Domestic awards are enforced under the Alternative Dispute Resolution Act 2010. Ghana''s courts have generally been supportive of arbitration, with a relatively low rate of award challenge and a track record of enforcing both domestic and foreign awards.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '25 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='dispute-resolution' LIMIT 1),
  ARRAY['arbitration','Ghana','West-Africa','GICAD','commercial']
),

-- 45. Viktor Andersen — IP Licensing for Cleantech
(
  'f0230045-0000-0000-0000-000000000000',
  'e0230044-0000-0000-0000-000000000000',
  'IP Licensing in Cleantech: How to Monetise Green Technology Without Losing Control',
  'ip-licensing-cleantech-monetisation-guide',
  'Cleantech companies sit on valuable IP portfolios that can generate significant licensing revenue. Here is how to structure licensing deals that create value without compromising your competitive position.',
  '<h2>The Cleantech Licensing Opportunity</h2><p>The global transition to clean energy and sustainable industry is creating unprecedented demand for green technology IP. Cleantech patent holders — in solar, wind, battery technology, carbon capture, and efficiency improvement — face growing licensing interest from established industrial companies seeking to accelerate their own sustainability transitions. Licensing, done well, creates revenue without additional capital investment.</p><h2>Exclusive vs. Non-Exclusive Licensing</h2><p>The fundamental licensing structure decision is between exclusive licensing (a single licensee gets all rights in a defined field or territory), sole licensing (licensor retains the right to use but grants one licensee), and non-exclusive licensing (multiple licensees). For cleantech, non-exclusive licensing in complementary industries or non-competing geographies can maximise revenue without creating direct competition. Model the trade-offs carefully for your specific technology and market.</p><h2>Royalty Structures</h2><p>Cleantech licensing royalties commonly take three forms: running royalties (a percentage of licensee revenue from the licensed technology); lump-sum payments (a fixed upfront fee, often preferred by licensees for budget predictability); and milestone payments (paid when the licensee achieves defined commercialisation milestones). Hybrid structures — lump sum plus running royalties — are increasingly common in cleantech deals.</p><h2>Field-of-Use Restrictions</h2><p>Field-of-use restrictions allow a licensor to license the same technology to multiple licensees for different applications. A battery chemistry patent could be licensed to an EV manufacturer for automotive applications, an energy storage company for grid applications, and a consumer electronics company for device applications — all simultaneously. This maximises revenue from a single patent family without competitive conflict.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '20 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='intellectual-property' LIMIT 1),
  ARRAY['cleantech','IP-licensing','patents','green-technology','sustainability']
),

-- 46. Preethi Rajan — Remote Work Employment Law
(
  'f0230046-0000-0000-0000-000000000000',
  'e0230045-0000-0000-0000-000000000000',
  'Remote Work and Indian Employment Law: What Employers Need to Know in 2025',
  'remote-work-indian-employment-law-2025',
  'Remote work is now the default for millions of Indian knowledge workers. But the legal framework governing remote employment in India remains underdeveloped. Here is what employers must navigate.',
  '<h2>The Legal Gap in Remote Work</h2><p>India''s employment law framework — built around the Factories Act, Shops and Establishments Acts, and various state-level labour regulations — was designed for an era of physical workplaces. The shift to remote and hybrid work has created a legal grey zone: many statutory obligations assume a physical workplace, and their application to home-based remote workers is unclear. Employers operating remote teams must navigate this uncertainty carefully.</p><h2>State-Level Shops and Establishments Compliance</h2><p>The Shops and Establishments Acts are state-level statutes that govern working hours, leave, and conditions of employment for commercial establishments. For remote workers working from home, the applicable Shops Act is typically the Act of the state where the employee is physically located. A Mumbai-based employer with remote employees in Bangalore, Hyderabad, and Chennai must technically comply with three different state laws for those employees.</p><h2>EPFO and ESIC for Remote Workers</h2><p>Employees'' Provident Fund (EPF) and Employees'' State Insurance (ESI) obligations apply regardless of whether an employee works on-site or remotely. The employer''s registered establishment remains the relevant entity for contribution purposes. However, ESI medical benefits are location-specific — remote workers outside an ESI-notified area may not be able to access ESI medical facilities, raising questions about the value of contribution.</p><h2>Equipment, Expenses, and Reimbursement</h2><p>Indian employment law does not yet provide clear guidance on employer obligations to provide or reimburse equipment and internet access costs for remote workers. Employers that provide laptops and equipment should ensure clear asset policies covering return on termination, data wiping obligations, and loss of equipment. Expense reimbursement policies should be clearly documented to avoid disputes.</p>',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '3 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='employment-law' LIMIT 1),
  ARRAY['India','remote-work','employment-law','HR','compliance']
),

-- 47. Tariq Osman — Doing Business in Kenya
(
  'f0230047-0000-0000-0000-000000000000',
  'e0230036-0000-0000-0000-000000000000',
  'Setting Up a Business in Kenya: The Legal, Tax, and Regulatory Framework for Foreign Investors',
  'setting-up-business-kenya-foreign-investors-guide',
  'Kenya remains East Africa''s most attractive destination for foreign business investment. Here is the complete legal and regulatory framework foreign investors need to navigate successfully.',
  '<h2>Legal Structures Available to Foreign Investors</h2><p>Foreign investors in Kenya can operate through a private limited company (most common), a public limited company (for larger businesses or future listing), a branch office (for companies wanting Kenyan presence without incorporating a subsidiary), or a representative office (for market research only, with no commercial activity). For most foreign investors, a private limited company with at least one Kenyan co-founder or local director offers the best balance of control and regulatory simplicity.</p><h2>The Incorporation Process</h2><p>Kenyan company incorporation is managed through the Business Registration Service (BRS) online portal and typically takes 3–7 business days. Requirements include: a company name reservation; articles and memorandum of association; details of directors and shareholders; and identification documents. Foreign shareholders must also comply with OECD CRS and beneficial ownership declaration requirements.</p><h2>Investment Incentives and Special Economic Zones</h2><p>Kenya offers several investment incentive frameworks. Export Processing Zones (EPZs) provide a 10-year corporate tax holiday and 25% rate for the following 10 years for qualifying export-oriented manufacturers. Special Economic Zones (SEZs) offer similar incentives for a broader range of activities. The Nairobi International Financial Centre (NIFC) provides a competitive regulatory and tax framework for financial services businesses.</p><h2>Work Permits for Foreign Employees</h2><p>Kenya''s immigration framework requires work permits for all foreign employees. The most common categories for professional workers are Class G (specific employment) and Class M (for investors or directors). Permit processing takes 4–8 weeks through the Immigration Department''s eCitizen portal. Recruit locally where possible — employment of Kenyans is generally a condition of certain investment incentives.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '27 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='company-incorporation' LIMIT 1),
  ARRAY['Kenya','business-setup','investment','East-Africa','company-formation']
),

-- 48. Li Wei — Forensic Accounting in China PE
(
  'f0230048-0000-0000-0000-000000000000',
  'e0230025-0000-0000-0000-000000000000',
  'Forensic Accounting in Chinese PE Portfolios: What Every Sponsor Needs to Know',
  'forensic-accounting-china-pe-portfolios',
  'Financial fraud in Chinese private equity portfolio companies is more common than sponsors publicly acknowledge. Here is what the warning signs look like and how to respond when you find them.',
  '<h2>The China PE Fraud Landscape</h2><p>China''s private equity market has produced extraordinary returns for early investors in sectors from e-commerce to EV batteries. But it has also produced a disproportionate number of accounting fraud cases — inflated revenues, fabricated customers, channel stuffing, and undisclosed related party transactions — that have cost investors billions. Understanding the fraud landscape is the first step in protecting your portfolio.</p><h2>Revenue Recognition Manipulation</h2><p>The most common fraud in Chinese PE portfolios is revenue inflation. Techniques include: recording future-period revenue in the current period (pull-forward); round-tripping cash through related parties to create the appearance of customer payments; inflating customer count by recording internal subsidiaries as external customers; and channel stuffing — recognising revenue on goods shipped to distributors who have an informal right of return. Each leaves forensic fingerprints.</p><h2>The Role of Bank Statement Verification</h2><p>In China, the most reliable single verification tool in a fraud investigation is direct bank statement confirmation — comparing the company''s reported cash position with bank-certified statements. Many Chinese companies that reported large cash balances have been found to have pledged those balances as collateral for undisclosed guarantees, leaving the reported "cash" unavailable. In every Chinese portfolio company review, verify bank balances directly.</p><h2>When to Engage Forensic Accountants</h2><p>Engage forensic accountants when: revenue growth significantly exceeds industry and peer benchmarks without a clear operational explanation; gross margins are materially higher than comparable companies; trade receivable days are growing faster than revenue; or management resists providing primary documentation for transactions. Acting early — before fraud becomes entrenched — dramatically improves recovery prospects.</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  7, 7, 1250,
  'published', NOW() - INTERVAL '12 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='forensic-audit' LIMIT 1),
  ARRAY['China','forensic-accounting','private-equity','fraud','portfolio']
),

-- 49. Patrick O'Reilly — Irish Payroll for US Companies
(
  'f0230049-0000-0000-0000-000000000000',
  'e0230021-0000-0000-0000-000000000000',
  'Setting Up Irish Payroll for US Companies Entering the European Market',
  'irish-payroll-setup-us-companies-european-market',
  'Ireland is the most popular European hub for US technology companies. Getting your Irish payroll right from the start — including PAYE, PRSI, and USC — sets the foundation for compliant European expansion.',
  '<h2>Why Ireland is the US Tech Gateway</h2><p>Ireland''s combination of English language, common law legal system, 12.5% corporate tax rate, EU single market access, and highly educated workforce makes it the preferred European entry point for US technology, financial services, and pharmaceutical companies. Setting up payroll correctly from day one is not just a compliance requirement — it sends a signal to prospective Irish hires that you are a serious employer.</p><h2>The Three Deductions: PAYE, PRSI, and USC</h2><p>Irish payroll involves three mandatory deductions: PAYE (Pay As You Earn income tax, ranging from 20% to 40%); PRSI (Pay Related Social Insurance, at 4% employee and 11.15% employer); and USC (Universal Social Charge, ranging from 0.5% to 8%). The interaction of these three creates effective marginal tax rates of up to 52% for higher earners — important context when benchmarking Irish salary packages against US equivalents.</p><h2>Registering as an Employer with Revenue</h2><p>Before paying any employee, you must register as an employer with Revenue (the Irish tax authority) through the Revenue Online Service (ROS). This creates your employer PAYE reference. You will also need an employer PRSI registration and a payroll software system compatible with Revenue''s real-time reporting system (PSWT). Payroll must be reported to Revenue on or before each payment date — there is no monthly summary filing in Ireland.</p><h2>Expatriate Packages and SARP</h2><p>The Special Assignee Relief Programme (SARP) provides income tax relief for certain categories of employees who are assigned from abroad to work in Ireland. The relief exempts 30% of employment income above €100,000 from income tax (but not PRSI or USC) for up to five years. For senior US assignees, SARP can be a significant recruitment tool — factor it into your expatriate package design.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '23 days',
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM services WHERE slug='payroll' LIMIT 1),
  ARRAY['Ireland','payroll','PAYE','US-companies','European-expansion']
),

-- 50. Kavya Nair — Internal Audit for Indian Mid-Market
(
  'f0230050-0000-0000-0000-000000000000',
  'e0230026-0000-0000-0000-000000000000',
  'Internal Audit for Indian Mid-Market Companies: Building a Function That Actually Adds Value',
  'internal-audit-indian-mid-market-companies',
  'Most Indian mid-market companies have an internal audit function that produces reports nobody reads. Here is how to build one that boards actually listen to.',
  '<h2>The Mid-Market Internal Audit Gap</h2><p>In India, the Companies Act 2013 mandates internal audits for certain classes of companies, including listed companies and those meeting specified turnover/borrowing thresholds. But the mandate has often been met with a minimal, compliance-checkbox approach — engaging a small CA firm to conduct a limited scope review and produce a report that management files away. This misses the enormous potential value that a properly functioning internal audit can deliver.</p><h2>Risk-Based Audit Planning</h2><p>A risk-based internal audit plan starts with an enterprise risk assessment — identifying the business risks that matter most to the company — and then focuses audit resources on testing controls related to those risks. For a typical Indian mid-market company, the highest-risk areas are likely to be: revenue recognition and collection; procurement and supplier payments; payroll and human resources; IT access controls and cybersecurity; and regulatory compliance. Build your audit plan around these areas.</p><h2>The Quality of Work Papers</h2><p>The quality of audit evidence documentation determines whether findings will withstand scrutiny. Work papers must document: what was tested, how it was tested, what the expected result was, what was actually found, and what conclusion was reached. Work papers that consist only of photocopied documents without analysis are not adequate. Invest in training your team on proper work paper standards.</p><h2>Reporting That Drives Action</h2><p>Internal audit reports are only valuable if they drive change. Structure your reports around findings that have clear root causes and practical recommendations — not just observations of what went wrong. Include a management action plan with specific owners and deadlines for each recommendation. Follow up on implementation at the next audit cycle. Repeat findings are a sign that the audit function is not being taken seriously.</p>',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  5, 5, 950,
  'published', NOW() - INTERVAL '28 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='internal-audit' LIMIT 1),
  ARRAY['India','internal-audit','mid-market','risk','governance']
),

-- 51. Hassan Al-Farsi — Free Zone Tax in UAE
(
  'f0230051-0000-0000-0000-000000000000',
  'e0230004-0000-0000-0000-000000000000',
  'UAE Free Zones and Corporate Tax: What Qualifying Free Zone Person Status Actually Means',
  'uae-free-zones-corporate-tax-qfzp-status',
  'The UAE''s free zone Corporate Tax exemption is more conditional than most businesses realise. Here is a precise guide to what it takes — and what risks to avoid.',
  '<h2>The QFZP Exemption: Not Automatic</h2><p>A common misconception among UAE free zone businesses is that their corporate tax rate is automatically 0%. It is not. To access the 0% rate on Qualifying Income, a free zone entity must achieve and maintain Qualifying Free Zone Person (QFZP) status. This requires meeting four conditions: being incorporated in a UAE free zone; having adequate substance in the UAE; having Qualifying Income (as defined); and not having elected to be subject to the standard CT regime.</p><h2>The Adequate Substance Requirement</h2><p>A QFZP must have "adequate substance" in the UAE relative to the activities it undertakes. This means having relevant assets, appropriate employees with the necessary qualifications, and management and decision-making functions occurring in the UAE. The FTA has not prescribed specific metrics for adequacy, which creates judgement. However, companies with minimal UAE presence — a registered address but no real operations — are clearly at risk of failing the substance requirement.</p><h2>Qualifying Income: What Counts</h2><p>Qualifying Income for QFZP purposes includes: income from transactions with other QFZPs or non-UAE persons; income from eligible activities within the free zone; and income from qualifying intellectual property. Income from transactions with UAE mainland persons is generally not Qualifying Income and is subject to the 9% standard rate. Mixed income businesses must carefully segregate and track their income streams.</p><h2>The De Minimis Rule</h2><p>A QFZP that earns non-Qualifying Income exceeding 5% of total revenues (or AED 5 million, whichever is lower) loses QFZP status for the entire tax period — not just on the non-qualifying income. This "cliff edge" creates a significant compliance management requirement for businesses that have any UAE mainland income. Monitor your income mix monthly and take action before year-end if you are approaching the threshold.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '9 days',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM services WHERE slug='corporate-tax' LIMIT 1),
  ARRAY['UAE','free-zone','corporate-tax','QFZP','FTA']
),

-- 52. Priya Venkatesh — GST Annual Return Filing
(
  'f0230052-0000-0000-0000-000000000000',
  'e0230009-0000-0000-0000-000000000000',
  'GSTR-9 and GSTR-9C: The Annual GST Return Filing Guide That Saves You From Notices',
  'gstr9-gstr9c-annual-gst-return-guide',
  'The annual GST return is the most scrutinised filing a business makes. Here is how to file it accurately and avoid the notices that land months later.',
  '<h2>The Importance of Annual Returns</h2><p>GSTR-9 is the annual return that reconciles a taxpayer''s monthly/quarterly GST filings for an entire financial year. GSTR-9C is the reconciliation statement certified by a CA/CMA, comparing the annual return data with the audited financial statements. These filings are the GST department''s primary tool for identifying mismatches, under-declarations, and ITC anomalies — and they form the basis for GST audit selections.</p><h2>Common GSTR-9 Reconciliation Issues</h2><p>The most frequent issues identified in GSTR-9 filings are: differences between revenue as reported in GST returns and revenue in financial statements (due to timing, exempt supplies, or non-GST transactions); ITC claimed in monthly returns that differs from supplier data in GSTR-2B; and outward supply values that differ between GSTR-1 and GSTR-3B due to amendment errors. Each difference requires explanation in GSTR-9C.</p><h2>ITC Reversal Obligations</h2><p>Annual return filing is the last opportunity to reverse ITC that should have been reversed during the year — for blocked credit, exempt supplies, or proportionate reversal on capital goods. Failure to reverse required ITC in GSTR-9 and pay the resulting tax with interest triggers notices. Calculate your reversal obligations before filing and include them in your annual return.</p><h2>Preparing for a GST Audit</h2><p>A well-prepared GSTR-9C significantly reduces the risk of a GST audit being triggered. Ensure your reconciliation statement accurately explains all differences between GST return data and financial statement data, with supporting calculations. Auditors are looking for unexplained discrepancies — explain everything, even if the net tax impact is nil.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  6, 6, 1100,
  'published', NOW() - INTERVAL '32 days',
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM services WHERE slug='gst-compliance' LIMIT 1),
  ARRAY['GST','India','GSTR-9','annual-return','compliance']
),

-- 53. Olumide Adeleke — Big Four Audit Quality in Africa
(
  'f0230053-0000-0000-0000-000000000000',
  'e0230023-0000-0000-0000-000000000000',
  'Audit Quality in Sub-Saharan Africa: Raising the Bar for Financial Assurance',
  'audit-quality-sub-saharan-africa',
  'Audit quality in Sub-Saharan Africa varies dramatically — from Big Four quality at the top to near-worthless rubber stamps at the bottom. Here is what good audit quality looks like and why it matters.',
  '<h2>The Audit Quality Spectrum</h2><p>Financial statement audit quality in Sub-Saharan Africa runs a wide spectrum. At one end, the Big Four and leading regional firms apply rigorous, internationally consistent audit methodologies backed by significant investment in technology, training, and quality control. At the other end, sole practitioners issue unqualified opinions with minimal testing, creating a false assurance that misleads investors, lenders, and regulators. Understanding where your auditor sits on this spectrum is a governance responsibility.</p><h2>What Audit Quality Actually Means</h2><p>Audit quality is not about the size of the firm — it is about whether the audit actually provides meaningful assurance that the financial statements are free from material misstatement. This requires: appropriate professional scepticism; sufficient, appropriate audit evidence; rigorous assessment of management judgements; and clear, accurate audit reporting. Audit committees must probe these dimensions, not just approve the auditor''s opinion.</p><h2>The Challenge of Auditing in African Markets</h2><p>African audit teams face challenges that their European and North American counterparts do not: limited availability of independent data for valuation assessments; weaker internal control environments in many clients; greater reliance on management representations due to limited third-party data; and higher fraud risk in some market segments. High-quality auditors adapt their methodologies to these realities rather than applying developed-market templates.</p><h2>Audit Tendering and Independence</h2><p>Long audit engagements — particularly where the lead partner has not rotated and the firm has extensive non-audit work with the same client — are a significant audit quality risk. Best practice in listed company governance includes periodic competitive tender of the audit, mandatory partner rotation, and restrictions on non-audit services. These governance practices are particularly important in markets where audit regulation and enforcement is weaker than in Europe or North America.</p>',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  6, 6, 1150,
  'published', NOW() - INTERVAL '35 days',
  '00000000-0000-0000-0000-000000000004',
  (SELECT id FROM services WHERE slug='statutory-audit' LIMIT 1),
  ARRAY['Africa','audit-quality','governance','financial-assurance','Nigeria']
),

-- 54. Chen Wei — China Securities Regulatory Reform
(
  'f0230054-0000-0000-0000-000000000000',
  'e0230034-0000-0000-0000-000000000000',
  'China''s Securities Market Reform: What Foreign Investors Need to Know in 2025',
  'china-securities-market-reform-2025-foreign-investors',
  'China''s securities markets have undergone significant regulatory reform since 2023. Here is what foreign institutional investors and companies considering Chinese market access need to understand.',
  '<h2>The Regulatory Agenda</h2><p>China''s securities regulatory reform since 2023 has been driven by two objectives: improving the quality of listed companies and their financial reporting, and creating a more attractive environment for foreign institutional investors. The CSRC has raised listing standards, tightened disclosure requirements, and cracked down on fraudulent IPO applications and earnings manipulation in listed companies. The results are beginning to show in improved audit quality and financial reporting standards.</p><h2>Registration-Based IPO System</h2><p>China completed its transition from an approval-based to a registration-based IPO system across all boards (Shanghai Main Board, Shenzhen Main Board, STAR Market, ChiNext, and the Beijing Stock Exchange) in 2023. This is a fundamental change: under the approval system, the CSRC effectively determined whether companies could list; under the registration system, the exchanges review disclosure documents and the market determines pricing. This increases market efficiency but also increases risk for investors.</p><h2>VIE Structures: Ongoing Uncertainty</h2><p>Foreign investors in Chinese technology and internet companies typically access their economic exposure through Variable Interest Entity (VIE) structures — contractual arrangements that create economic rights without direct equity ownership. VIE structures remain in a legal grey zone: they have never been formally approved by Chinese regulators. The CSRC''s approach to VIE structures in the context of overseas listings has evolved but remains uncertain.</p><h2>Northbound Stock Connect and Foreign Access</h2><p>The Stock Connect programmes (Shanghai-Hong Kong and Shenzhen-Hong Kong) provide foreign investors with access to A-shares without QFII licensing requirements. Eligible securities and investment limits have expanded significantly. For foreign institutional investors wanting China A-share exposure without direct CIBM or QFII access, Stock Connect is now the primary channel. Understand the eligibility criteria, settlement rules, and repatriation framework before investing.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  7, 7, 1300,
  'published', NOW() - INTERVAL '16 days',
  '00000000-0000-0000-0000-000000000005',
  (SELECT id FROM services WHERE slug='securities-law' LIMIT 1),
  ARRAY['China','securities','CSRC','IPO','foreign-investors']
),

-- 55. Fatima Malik — Employment Contracts in Pakistan
(
  'f0230055-0000-0000-0000-000000000000',
  'e0230041-0000-0000-0000-000000000000',
  'Employment Contracts in Pakistan: What Employers Are Getting Wrong',
  'employment-contracts-pakistan-common-mistakes',
  'Pakistani employment law is fragmented across federal and provincial frameworks. Here are the most common employment contract mistakes that expose employers to liability.',
  '<h2>The Multi-Layer Legal Framework</h2><p>Pakistani employment law is complex because it operates across multiple layers: the federal Industrial Relations Act 2012 (for interprovincial companies), provincial industrial relations acts, the Shops and Establishments Ordinances (province-specific), the Employees Old-Age Benefits Act (EOBI), and the provincial social security laws. An employment contract that is valid and adequate in one province may not adequately address requirements in another. Draft contracts with this complexity in mind.</p><h2>Defining the Nature of Employment</h2><p>Pakistani courts and labour tribunals distinguish between permanent, temporary, contractual, and daily-wage employees — each with different rights and termination obligations. Misclassifying a permanent employee as a contractual or temporary worker is one of the most common and costly mistakes. If an employee has been in continuous service for three months performing core business functions, Pakistani courts will typically treat them as a permanent employee regardless of how the contract labels them.</p><h2>Probation Clauses</h2><p>The standard probationary period in Pakistan is three months, though six months is permissible by agreement. During probation, employers generally have greater flexibility to terminate. However, termination even during probation must be for valid reasons and must follow any notice provisions in the contract. Terminating a probationary employee for causes related to protected characteristics (gender, religion, disability) remains unlawful.</p><h2>EOBI and SESSI Compliance</h2><p>Every employer with five or more employees must register with EOBI and contribute 5% of basic wages (1% employee, 4% employer). Provincial SESSI requirements for health insurance vary by province. Failure to register and contribute creates significant liability — EOBI and provincial social security authorities regularly audit employer compliance, and non-compliance triggers penalty assessments and personal liability for directors.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  5, 5, 950,
  'published', NOW() - INTERVAL '24 days',
  '00000000-0000-0000-0000-000000000006',
  (SELECT id FROM services WHERE slug='employment-law' LIMIT 1),
  ARRAY['Pakistan','employment-law','contracts','HR','compliance']
);
