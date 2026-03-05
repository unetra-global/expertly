-- ─── Expertly Seed Data v2 ────────────────────────────────────────────────────
-- Uses correct auto-generated user IDs from Supabase trigger
-- Run AFTER migrations 019, 020, 021

BEGIN;

-- ─── Step 1: Update public.users (set names, roles) ─────────────────────────

UPDATE public.users SET
  first_name = 'Alice', last_name = 'Morgan', role = 'member'
WHERE id = 'a17a031c-2c2e-4e0b-a743-174b6de70e6b';

UPDATE public.users SET
  first_name = 'James', last_name = 'Okafor', role = 'member'
WHERE id = '3cc40498-ff73-4234-8eb9-84d75511c2ac';

UPDATE public.users SET
  first_name = 'Priya', last_name = 'Sharma', role = 'member'
WHERE id = '15a90e7d-b17c-4d06-ba97-dd2f0869abc7';

UPDATE public.users SET
  first_name = 'Tom', last_name = 'Chen', role = 'member'
WHERE id = '7cdd7545-2f67-41bc-9113-1373ac030f0e';

UPDATE public.users SET
  first_name = 'Sarah', last_name = 'Williams', role = 'member'
WHERE id = '47eebf46-36d4-4391-89a3-b61adcf30578';

UPDATE public.users SET
  first_name = 'Ops', last_name = 'Admin', role = 'backend_admin'
WHERE id = '98975757-0ed7-440b-8707-9e21591e1bc8';

-- ─── Step 2: Insert Members ────────────────────────────────────────────────────

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
-- Alice Morgan — Corporate Lawyer, UK (seasoned, verified, featured)
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  'a17a031c-2c2e-4e0b-a743-174b6de70e6b',
  'alice-morgan',
  'Partner, Corporate & M&A Law',
  'Helping businesses navigate complex M&A transactions and corporate governance challenges across the UK and EU.',
  'Alice Morgan is a seasoned corporate lawyer with over 18 years of experience advising FTSE 250 companies, private equity funds, and high-growth startups on mergers, acquisitions, corporate restructuring, and regulatory compliance. She has led cross-border transactions exceeding £2 billion and is a trusted advisor to boards on governance and fiduciary duties.',
  'London', 'GB', 'seasoned_professional',
  true, NOW() - INTERVAL '60 days', true,
  '6fe63974-a598-4904-8246-ec21a6d5316b', -- company-incorporation
  18, 500, 1500,
  'active', CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '185 days',
  'https://linkedin.com/in/alice-morgan-law',
  'https://alicemorgan.law',
  '[{"company":"Clifford Chance","title":"Partner","from":"2018","to":"present","description":"Lead corporate M&A practice"},{"company":"Allen & Overy","title":"Senior Associate","from":"2010","to":"2018","description":"Corporate and capital markets"}]',
  '[{"institution":"University of Oxford","degree":"BCL (Bachelor of Civil Law)","year":"2005"},{"institution":"London School of Economics","degree":"LLB","year":"2004"}]',
  '[{"name":"Solicitor of the Supreme Court","issuer":"SRA","year":"2006"},{"name":"Qualified Arbitrator","issuer":"Chartered Institute of Arbitrators","year":"2015"}]'
),
-- James Okafor — Virtual CFO, Nigeria (seasoned, verified, featured)
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  '3cc40498-ff73-4234-8eb9-84d75511c2ac',
  'james-okafor',
  'Virtual CFO & Financial Strategy Advisor',
  'Empowering African SMEs and startups with strategic financial leadership without the cost of a full-time CFO.',
  'James Okafor is a Chartered Accountant and Virtual CFO with 14 years of experience spanning Big 4 advisory, investment banking, and CFO roles. He specialises in financial modelling, fundraising readiness, and building finance functions from scratch for growth-stage companies across Africa and the diaspora.',
  'Lagos', 'NG', 'seasoned_professional',
  true, NOW() - INTERVAL '45 days', true,
  'e2fd667f-8d8f-4a74-a3fb-88a2c202c175', -- virtual-cfo
  14, 200, 800,
  'active', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days',
  'https://linkedin.com/in/james-okafor-cfo',
  'https://jamesokafor.finance',
  '[{"company":"Okafor & Partners","title":"Founder & Virtual CFO","from":"2019","to":"present","description":"Virtual CFO services for 20+ African SMEs"},{"company":"KPMG Nigeria","title":"Senior Manager","from":"2013","to":"2019","description":"Financial advisory and audit"}]',
  '[{"institution":"University of Lagos","degree":"BSc Accounting","year":"2009"},{"institution":"ICAN","degree":"Chartered Accountant","year":"2011"}]',
  '[{"name":"Fellow, Institute of Chartered Accountants of Nigeria","issuer":"ICAN","year":"2016"},{"name":"Certified Management Accountant","issuer":"IMA","year":"2017"}]'
),
-- Priya Sharma — Corporate Tax, India (seasoned, verified)
(
  'aaaaaaaa-0000-0000-0000-000000000003',
  '15a90e7d-b17c-4d06-ba97-dd2f0869abc7',
  'priya-sharma',
  'Director — International & Corporate Tax',
  'Expert in transfer pricing, BEPS compliance, and cross-border tax structuring for multinationals operating in India.',
  'Priya Sharma brings 12 years of deep expertise in Indian and international tax, with a specialisation in transfer pricing and cross-border structuring. She has advised Fortune 500 companies on BEPS compliance, APAs, and tax-efficient holding structures. Previously a Director at Deloitte India, she now runs her own boutique tax advisory practice.',
  'Mumbai', 'IN', 'seasoned_professional',
  true, NOW() - INTERVAL '30 days', false,
  '60c7d64d-fb5e-4a7d-af3d-247f7f8a611e', -- corporate-tax
  12, 150, 600,
  'active', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '245 days',
  'https://linkedin.com/in/priya-sharma-tax',
  NULL,
  '[{"company":"Sharma Tax Advisory","title":"Founder","from":"2020","to":"present","description":"Boutique international tax practice"},{"company":"Deloitte India","title":"Director — Tax","from":"2015","to":"2020","description":"Transfer pricing and international tax"}]',
  '[{"institution":"National Law School of India University","degree":"LLM (Taxation)","year":"2012"},{"institution":"University of Mumbai","degree":"BCom (Hons)","year":"2010"}]',
  '[{"name":"Chartered Accountant","issuer":"ICAI","year":"2013"},{"name":"Certified Transfer Pricing Professional","issuer":"TP Forum","year":"2016"}]'
),
-- Tom Chen — M&A Advisory, Singapore (seasoned, verified, featured)
(
  'aaaaaaaa-0000-0000-0000-000000000004',
  '7cdd7545-2f67-41bc-9113-1373ac030f0e',
  'tom-chen',
  'M&A Advisor & Corporate Finance Specialist',
  'Advising technology companies and PE-backed businesses on acquisitions, divestitures, and strategic partnerships across Southeast Asia.',
  'Tom Chen is a corporate finance specialist with 10 years of M&A and capital markets experience across Singapore, Hong Kong, and Greater China. He has executed over 30 transactions with an aggregate deal value exceeding USD 3 billion. Tom specialises in technology sector M&A, cross-border deals, and carve-out transactions.',
  'Singapore', 'SG', 'seasoned_professional',
  true, NOW() - INTERVAL '20 days', true,
  '3a1ce205-1b6e-404c-b6e7-5f35b95dc4fa', -- ma-advisory
  10, 400, 1200,
  'active', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days',
  'https://linkedin.com/in/tom-chen-ma',
  'https://tomchen-advisory.com',
  '[{"company":"Chen Capital Advisory","title":"Founder","from":"2021","to":"present","description":"Independent M&A advisory boutique"},{"company":"Goldman Sachs","title":"Vice President","from":"2016","to":"2021","description":"Technology M&A, Asia Pacific"},{"company":"Morgan Stanley","title":"Associate","from":"2013","to":"2016","description":"Investment banking"}]',
  '[{"institution":"INSEAD","degree":"MBA","year":"2013"},{"institution":"National University of Singapore","degree":"BBA Finance","year":"2011"}]',
  '[{"name":"CFA Charterholder","issuer":"CFA Institute","year":"2014"},{"name":"Licensed Capital Markets Services","issuer":"MAS Singapore","year":"2016"}]'
),
-- Sarah Williams — Contract Drafting, US (budding, not yet verified)
(
  'aaaaaaaa-0000-0000-0000-000000000005',
  '47eebf46-36d4-4391-89a3-b61adcf30578',
  'sarah-williams',
  'Commercial Contracts & IP Attorney',
  'Helping startups and SMEs draft, review, and negotiate commercial contracts and IP agreements that protect their interests.',
  'Sarah Williams is a US-qualified attorney with 5 years of experience in commercial law, focusing on SaaS agreements, NDAs, IP licensing, and employment contracts. After leaving BigLaw, she now advises startups and SMEs through her own practice, making quality legal help accessible to businesses at every stage.',
  'New York', 'US', 'budding_entrepreneur',
  false, NULL, false,
  '12fac124-5eb6-4511-ae14-48724039fecd', -- contract-drafting
  5, 100, 350,
  'active', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '351 days',
  'https://linkedin.com/in/sarah-williams-attorney',
  NULL,
  '[{"company":"Williams Legal LLC","title":"Founder","from":"2022","to":"present","description":"Commercial law for startups"},{"company":"Skadden Arps","title":"Associate","from":"2019","to":"2022","description":"Corporate and commercial contracts"}]',
  '[{"institution":"Yale Law School","degree":"JD","year":"2019"},{"institution":"UC Berkeley","degree":"BA Political Science","year":"2016"}]',
  '[{"name":"New York Bar Admission","issuer":"New York State Bar","year":"2019"},{"name":"California Bar Admission","issuer":"State Bar of California","year":"2020"}]'
);

-- ─── Step 3: Member Services (primary + secondary) ───────────────────────────

INSERT INTO member_services (member_id, service_id, is_primary) VALUES
-- Alice Morgan: primary=company-incorporation, secondary=corporate-governance, ma-advisory, securities-law
('aaaaaaaa-0000-0000-0000-000000000001', '6fe63974-a598-4904-8246-ec21a6d5316b', true),
('aaaaaaaa-0000-0000-0000-000000000001', 'cd31b9ab-7fd0-468a-8953-ee7c75d2fa8a', false),
('aaaaaaaa-0000-0000-0000-000000000001', '3a1ce205-1b6e-404c-b6e7-5f35b95dc4fa', false),
('aaaaaaaa-0000-0000-0000-000000000001', 'ba7241ec-2914-4823-90f8-c44496be81a9', false),
-- James Okafor: primary=virtual-cfo, secondary=financial-reporting, bookkeeping
('aaaaaaaa-0000-0000-0000-000000000002', 'e2fd667f-8d8f-4a74-a3fb-88a2c202c175', true),
('aaaaaaaa-0000-0000-0000-000000000002', 'a9b72494-8e7d-48aa-b914-1a1462897695', false),
('aaaaaaaa-0000-0000-0000-000000000002', 'ac78f21a-e689-4aa9-9e1e-4c060a8fd4da', false),
-- Priya Sharma: primary=corporate-tax, secondary=transfer-pricing, international-tax, gst-advisory
('aaaaaaaa-0000-0000-0000-000000000003', '60c7d64d-fb5e-4a7d-af3d-247f7f8a611e', true),
('aaaaaaaa-0000-0000-0000-000000000003', '38cfe318-9d22-48d7-80c9-a8c5af277ccc', false),
('aaaaaaaa-0000-0000-0000-000000000003', '5c8df651-bf5f-4d32-88de-e36696eae0e0', false),
('aaaaaaaa-0000-0000-0000-000000000003', 'a20a8132-61d4-432b-9ac6-b45d9367b8d5', false),
-- Tom Chen: primary=ma-advisory, secondary=corporate-governance, securities-law, due-diligence
('aaaaaaaa-0000-0000-0000-000000000004', '3a1ce205-1b6e-404c-b6e7-5f35b95dc4fa', true),
('aaaaaaaa-0000-0000-0000-000000000004', 'cd31b9ab-7fd0-468a-8953-ee7c75d2fa8a', false),
('aaaaaaaa-0000-0000-0000-000000000004', 'ba7241ec-2914-4823-90f8-c44496be81a9', false),
('aaaaaaaa-0000-0000-0000-000000000004', 'f874d21e-2d36-45c5-a375-39acbaa85094', false),
-- Sarah Williams: primary=contract-drafting, secondary=employment-law, dispute-resolution
('aaaaaaaa-0000-0000-0000-000000000005', '12fac124-5eb6-4511-ae14-48724039fecd', true),
('aaaaaaaa-0000-0000-0000-000000000005', '0defc4b0-f839-4cf6-805d-1c9c50ce5483', false),
('aaaaaaaa-0000-0000-0000-000000000005', '0554bdbd-0b9a-4f76-a7a9-841623ab7280', false);

-- ─── Step 4: Notification Preferences ───────────────────────────────────────

INSERT INTO member_notification_preferences (
  member_id,
  consultation_requests, article_status, membership_reminders,
  regulatory_nudges, platform_updates
) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', true,  true,  true,  true,  true),
('aaaaaaaa-0000-0000-0000-000000000002', true,  true,  true,  false, true),
('aaaaaaaa-0000-0000-0000-000000000003', true,  false, true,  true,  false),
('aaaaaaaa-0000-0000-0000-000000000004', true,  true,  true,  false, true),
('aaaaaaaa-0000-0000-0000-000000000005', false, true,  true,  false, true);

-- ─── Step 5: Articles ─────────────────────────────────────────────────────────

INSERT INTO articles (
  id, author_id, title, slug, excerpt, body,
  featured_image_url, cover_image_url,
  read_time, read_time_minutes, word_count,
  status, published_at,
  category_id, service_id, tags
) VALUES
-- Article 1: Alice — Corporate Governance
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'The Director''s Duty of Care: What Every Board Member Needs to Know in 2024',
  'directors-duty-of-care-2024',
  'Board members face increasing scrutiny. Understanding the evolving duty of care — and how to demonstrate it — has never been more critical for UK company directors.',
  '<h2>Introduction</h2><p>The role of a company director has never carried more responsibility. With regulators, shareholders, and the public demanding greater accountability, understanding the legal duty of care that underpins your role is no longer optional — it is existential.</p><h2>What Does the Duty of Care Mean?</h2><p>Under the Companies Act 2006, every director of a UK company must act with reasonable care, skill, and diligence. This is assessed against two benchmarks: the objective standard (what a reasonably diligent person with general knowledge and experience of a director would do) and the subjective standard (your particular skills, knowledge, and experience).</p><h2>Recent Case Law: Key Takeaways</h2><p>The 2023 Court of Appeal decision in <em>Sequoia Capital v Westhall</em> reaffirmed that directors cannot simply rely on executive management. Non-executive directors, in particular, must engage substantively in governance — not merely attend meetings.</p><h2>Practical Steps to Demonstrate Compliance</h2><ul><li>Maintain detailed board minutes that reflect genuine deliberation</li><li>Challenge management assumptions with documented questions</li><li>Seek independent professional advice on complex matters</li><li>Review board information packs critically before each meeting</li></ul><h2>The FRC Corporate Governance Code 2024</h2><p>The updated Code, effective for financial years beginning 1 January 2024, places greater emphasis on sustainability, stakeholder engagement, and internal controls assurance. Boards should audit their governance frameworks against the new Provision 29 requirements on internal controls reporting.</p><h2>Conclusion</h2><p>The duty of care is not a bureaucratic formality — it is the foundation of effective corporate leadership. Directors who treat it as such will not only protect themselves legally but will also drive better outcomes for their companies and stakeholders.</p>',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  8, 8, 1650,
  'published', NOW() - INTERVAL '15 days',
  '00000000-0000-0000-0000-000000000005', -- Corporate Law category
  '6fe63974-a598-4904-8246-ec21a6d5316b', -- company-incorporation
  ARRAY['corporate-governance', 'directors-duties', 'company-law', 'UK']
),
-- Article 2: Alice — M&A Due Diligence
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'M&A Due Diligence: The Legal Checklist That Protects Your Acquisition',
  'ma-due-diligence-legal-checklist',
  'A rigorous legal due diligence process can be the difference between a successful acquisition and an expensive mistake. Here is what every buyer''s counsel should be reviewing.',
  '<h2>Why Legal Due Diligence Matters</h2><p>In the heat of an acquisition, commercial teams often focus on financial performance and market opportunity. But legal due diligence — when done well — surfaces the risks that can unwind a deal, reduce consideration, or haunt buyers for years post-close.</p><h2>The Core Legal Due Diligence Checklist</h2><h3>1. Corporate Structure and Title</h3><p>Verify the target''s corporate structure, share registry, and ownership chain. Are there any undisclosed shareholders? Are shares properly issued and free from encumbrances?</p><h3>2. Material Contracts</h3><p>Review all significant customer, supplier, and licensing agreements. Identify change-of-control provisions, termination rights, and exclusivity obligations that could affect deal value.</p><h3>3. Intellectual Property</h3><p>Confirm ownership and registration status of all IP. Check for assignments from founders and employees. Assess any infringement claims or licensing restrictions.</p><h3>4. Employment and HR</h3><p>Review employment contracts, non-compete clauses, and any pending employment tribunal claims. Assess TUPE implications for UK targets.</p><h3>5. Litigation and Regulatory</h3><p>Identify all pending, threatened, or settled litigation. Review regulatory correspondence, licences, and any outstanding compliance issues.</p><h2>Red Flags That Should Pause a Deal</h2><ul><li>Undisclosed related-party transactions</li><li>Broad indemnification obligations in customer contracts</li><li>Unregistered IP or disputed ownership</li><li>Ongoing regulatory investigations</li></ul><h2>Structuring Your Findings</h2><p>A well-structured legal due diligence report distinguishes between deal-critical risks (which require mitigation or walk-away), price-adjustable risks (which inform consideration), and manageable risks (which are addressed post-close).</p>',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  10, 10, 1900,
  'published', NOW() - INTERVAL '8 days',
  '00000000-0000-0000-0000-000000000005', -- Corporate Law
  '3a1ce205-1b6e-404c-b6e7-5f35b95dc4fa', -- ma-advisory
  ARRAY['M&A', 'due-diligence', 'acquisitions', 'corporate-law']
),
-- Article 3: James — Virtual CFO
(
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000002',
  'When Your Startup Needs a Virtual CFO (and When It Doesn''t)',
  'when-startup-needs-virtual-cfo',
  'A full-time CFO is a luxury most early-stage startups cannot afford. A Virtual CFO might be the strategic lever your business is missing — but only if the timing is right.',
  '<h2>The CFO Gap in Early-Stage Companies</h2><p>Most startups reach Series A with a bookkeeper, a founder who is obsessed with burn rate, and a spreadsheet that was last updated three weeks ago. Sound familiar? This is the CFO gap — the period when your finance function has outgrown founder oversight but cannot yet justify a £200,000 annual hire.</p><h2>What Does a Virtual CFO Actually Do?</h2><p>A Virtual CFO is a senior finance professional who provides strategic financial leadership on a fractional or project basis. Think of it as accessing CFO-level thinking at a fraction of the cost. The role typically covers:</p><ul><li>Financial modelling and scenario planning</li><li>Investor reporting and fundraising preparation</li><li>Cash flow forecasting and treasury management</li><li>Building and managing your finance team</li><li>Board-level financial communication</li></ul><h2>The Right Time to Hire a Virtual CFO</h2><p>The signals are usually clear: your monthly revenue exceeds $50K, you are preparing for a funding round, your accounts are consistently late, or your bank has started asking difficult questions. At this point, fractional finance leadership is not a luxury — it is a necessity.</p><h2>What to Look For</h2><p>Industry experience matters enormously. A Virtual CFO who has scaled SaaS businesses understands ARR, churn, and unit economics intuitively. One who has only worked in manufacturing may struggle with your business model. Always check references and ask for specific examples of fundraising outcomes.</p><h2>Cost vs. Value</h2><p>A good Virtual CFO typically costs £3,000–£8,000 per month depending on scope. The return — a clean data room that closes your next round, or a cash flow model that avoids an overdraft crisis — is almost always multiples of that investment.</p>',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  7, 7, 1400,
  'published', NOW() - INTERVAL '20 days',
  '00000000-0000-0000-0000-000000000003', -- Accounting category
  'e2fd667f-8d8f-4a74-a3fb-88a2c202c175', -- virtual-cfo
  ARRAY['virtual-CFO', 'startup-finance', 'fundraising', 'financial-strategy']
),
-- Article 4: Priya — BEPS and Transfer Pricing
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000003',
  'BEPS 2.0 and the Global Minimum Tax: What Indian Multinationals Must Do Now',
  'beps-global-minimum-tax-india-multinationals',
  'The OECD''s Pillar Two global minimum tax is becoming reality. Indian multinationals with global revenues above EUR 750 million need to act — here is a practical compliance roadmap.',
  '<h2>The BEPS 2.0 Landscape</h2><p>The OECD''s Base Erosion and Profit Shifting (BEPS) 2.0 framework, specifically Pillar Two (the Global Anti-Base Erosion rules, or GloBE rules), introduces a global minimum effective tax rate of 15% for large multinationals. As countries begin enacting domestic legislation, Indian MNCs with operations in low-tax jurisdictions face significant compliance and restructuring decisions.</p><h2>Who Is Affected?</h2><p>Pillar Two applies to multinational enterprise groups with annual consolidated group revenue of EUR 750 million or more. If your group meets this threshold and has subsidiaries in jurisdictions with effective tax rates below 15%, you are in scope.</p><h2>Key Compliance Requirements</h2><h3>Income Inclusion Rule (IIR)</h3><p>The IIR requires the parent entity to pay a top-up tax if a subsidiary''s effective tax rate falls below 15%. India is expected to implement the IIR by 2025 — but the window for preparation is now.</p><h3>Undertaxed Profits Rule (UTPR)</h3><p>The UTPR acts as a backstop: if the parent jurisdiction has not applied the IIR, other group entities can impose the top-up tax. This creates exposure even if your parent is in a non-implementing jurisdiction.</p><h2>Priority Actions for Indian MNCs</h2><ol><li>Map all group entities by jurisdiction and compute effective tax rates using the GloBE definition</li><li>Identify low-tax subsidiaries and assess top-up tax exposure</li><li>Review intercompany pricing for transactions that affect jurisdictional profit allocation</li><li>Model the P&L impact of Pillar Two under multiple scenarios</li><li>Engage with local advisors in each affected jurisdiction</li></ol><h2>Transfer Pricing Considerations</h2><p>Pillar Two interacts significantly with transfer pricing. Arrangements that were previously tax-efficient may now trigger top-up taxes. A comprehensive review of your transfer pricing policy in light of GloBE rules is essential.</p>',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  12, 12, 2100,
  'published', NOW() - INTERVAL '5 days',
  '00000000-0000-0000-0000-000000000001', -- Direct Tax category
  '60c7d64d-fb5e-4a7d-af3d-247f7f8a611e', -- corporate-tax
  ARRAY['BEPS', 'transfer-pricing', 'global-minimum-tax', 'India', 'OECD']
),
-- Article 5: Tom — M&A in Tech
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000004',
  'Technology M&A in Southeast Asia: Trends and Opportunities in 2025',
  'technology-ma-southeast-asia-2025',
  'Southeast Asia''s tech M&A market is maturing rapidly. Deal volumes are down from 2021 peaks, but deal quality — and buyer sophistication — is sharply higher. Here is what is driving activity in 2025.',
  '<h2>A Market Finding Its Footing</h2><p>After the frothy deal-making of 2020–2022 fuelled by cheap capital and pandemic-era digital tailwinds, Southeast Asia''s technology M&A market entered a correction period. Valuations reset sharply. Several high-profile unicorns have quietly shelved IPO plans. But beneath the surface, deal activity remains robust — driven by strategic rather than financial buyers.</p><h2>Dominant Deal Themes in 2025</h2><h3>Consolidation in Fintech</h3><p>The region''s fragmented payments and lending landscape is consolidating. Larger banks and established fintech platforms are acquiring smaller neobanks, BNPL providers, and digital insurance platforms to expand their product suite and customer base without the cost of organic build.</p><h3>Cross-Border Platforms</h3><p>The ASEAN Economic Community continues to create opportunities for platforms that can operate across multiple markets. Acquirers are targeting businesses with proven multi-country operations and regulatory licences in hand — particularly in Indonesia, Vietnam, and the Philippines.</p><h3>AI-Native Businesses</h3><p>Strategic acquirers — particularly in enterprise software and logistics — are acquiring early-stage AI-native companies primarily for talent and proprietary datasets. These acqui-hire transactions often close quickly and below traditional revenue multiples but deliver disproportionate strategic value.</p><h2>Valuation Realities</h2><p>Revenue multiples in Southeast Asian tech have compressed from 8–12x in 2021 to 3–6x today, reflecting both global rate normalisation and Asia-specific risk premiums. Profitability (or a credible path to it) is now table stakes for premium valuations.</p><h2>For Sellers: Preparing Your Business</h2><p>Buyers are conducting more rigorous due diligence than at any point in the past decade. Clean accounts, documented IP ownership, and a well-managed cap table are minimum requirements. Sellers who invested in governance during the downturn are commanding better terms today.</p>',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  9, 9, 1750,
  'published', NOW() - INTERVAL '3 days',
  '00000000-0000-0000-0000-000000000005', -- Corporate Law
  '3a1ce205-1b6e-404c-b6e7-5f35b95dc4fa', -- ma-advisory
  ARRAY['M&A', 'Southeast-Asia', 'technology', 'fintech', 'Singapore']
);

-- ─── Step 6: Events ───────────────────────────────────────────────────────────

INSERT INTO events (
  id, organizer_id, title, slug, description,
  start_date, end_date,
  country, city, venue_name,
  is_virtual, event_type, event_format,
  capacity, registration_url,
  status, is_published, is_featured, is_free,
  tags, speakers, organiser_name
) VALUES
-- Event 1: London Corporate Law Summit (in-person, upcoming)
(
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001', -- Alice
  'UK Corporate Law Summit 2025',
  'uk-corporate-law-summit-2025',
  'A premier gathering of corporate lawyers, in-house counsel, and board directors exploring the latest developments in UK company law, M&A regulation, and ESG governance. Featuring keynote sessions, panel discussions, and networking with top practitioners.',
  NOW() + INTERVAL '45 days',
  NOW() + INTERVAL '45 days' + INTERVAL '8 hours',
  'GB', 'London', 'The Savoy Conference Centre',
  false, 'conference', 'in_person',
  300, 'https://expertly.dev/events/uk-corporate-law-summit-2025/register',
  'published', true, true, false,
  ARRAY['corporate-law', 'M&A', 'governance', 'ESG', 'London'],
  '[{"name":"Alice Morgan","title":"Partner, Corporate & M&A Law","company":"Independent"},{"name":"Lord Justice Barker","title":"Court of Appeal Judge","company":"UK Courts"},{"name":"Sarah Chen","title":"Group General Counsel","company":"FTSE 100 Corp"}]',
  'Expertly & The Law Society'
),
-- Event 2: Virtual CFO Masterclass (virtual, upcoming)
(
  'cccccccc-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000002', -- James
  'Virtual CFO Masterclass: Building Finance Functions for Growth-Stage Startups',
  'virtual-cfo-masterclass-2025',
  'An intensive half-day masterclass for finance professionals and founders who want to understand what great financial leadership looks like at the growth stage. Topics include financial modelling, investor reporting, fundraising readiness, and building scalable finance teams. Certificate of attendance provided.',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '4 hours',
  'NG', 'Lagos', NULL,
  true, 'webinar', 'virtual',
  500, 'https://expertly.dev/events/virtual-cfo-masterclass-2025/register',
  'published', true, false, false,
  ARRAY['virtual-CFO', 'financial-strategy', 'startup-finance', 'Africa'],
  '[{"name":"James Okafor","title":"Virtual CFO & Strategy Advisor","company":"Okafor & Partners"},{"name":"Amaka Eze","title":"CFO","company":"Paystack (acquired by Stripe)"}]',
  'James Okafor & Expertly'
),
-- Event 3: India Tax & Transfer Pricing Roundtable (in-person, upcoming)
(
  'cccccccc-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000003', -- Priya
  'India Transfer Pricing & BEPS 2.0 Roundtable 2025',
  'india-transfer-pricing-beps-roundtable-2025',
  'An exclusive roundtable for tax directors and CFOs of Indian multinationals to discuss the practical implications of Pillar Two, recent APA trends, and the Indian Revenue''s evolving approach to transfer pricing. Strictly limited to 40 participants to ensure high-quality discussion.',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days' + INTERVAL '5 hours',
  'IN', 'Mumbai', 'Taj Mahal Palace Hotel',
  false, 'networking', 'in_person',
  40, 'https://expertly.dev/events/india-transfer-pricing-roundtable-2025/register',
  'published', true, false, false,
  ARRAY['transfer-pricing', 'BEPS', 'India', 'international-tax', 'Pillar-Two'],
  '[{"name":"Priya Sharma","title":"Director — International Tax","company":"Sharma Tax Advisory"},{"name":"Rahul Mehta","title":"Principal Commissioner","company":"Income Tax Department, India"}]',
  'Sharma Tax Advisory & Expertly'
),
-- Event 4: SEA Tech M&A Forum (hybrid, upcoming)
(
  'cccccccc-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000004', -- Tom
  'Southeast Asia Tech M&A Forum 2025',
  'sea-tech-ma-forum-2025',
  'The region''s leading event for technology M&A practitioners. Covering deal origination, valuation methodologies, regulatory approvals, and post-merger integration. Featuring case studies from recent transactions, investor panels, and curated networking sessions. Hybrid format — attend in Singapore or join virtually.',
  NOW() + INTERVAL '60 days',
  NOW() + INTERVAL '60 days' + INTERVAL '9 hours',
  'SG', 'Singapore', 'Marina Bay Sands Expo & Convention Centre',
  false, 'conference', 'hybrid',
  250, 'https://expertly.dev/events/sea-tech-ma-forum-2025/register',
  'published', true, true, false,
  ARRAY['M&A', 'Southeast-Asia', 'technology', 'private-equity', 'Singapore'],
  '[{"name":"Tom Chen","title":"M&A Advisor","company":"Chen Capital Advisory"},{"name":"Sophie Tan","title":"Managing Partner","company":"Sequoia Southeast Asia"},{"name":"David Park","title":"Head of Corp Dev","company":"Grab"}]',
  'Chen Capital Advisory & Expertly'
);

COMMIT;

-- Verify seed results
SELECT 'Users updated:' AS check, COUNT(*) FROM public.users WHERE first_name IS NOT NULL AND first_name != '';
SELECT 'Members inserted:' AS check, COUNT(*) FROM members;
SELECT 'Member services:' AS check, COUNT(*) FROM member_services;
SELECT 'Notification prefs:' AS check, COUNT(*) FROM member_notification_preferences;
SELECT 'Articles inserted:' AS check, COUNT(*) FROM articles;
SELECT 'Events inserted:' AS check, COUNT(*) FROM events;
