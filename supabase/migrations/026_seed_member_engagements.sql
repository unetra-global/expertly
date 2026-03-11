-- Migration 026: Seed key engagements for all members
-- Each member gets 5 engagements drawn from a realistic pool

DO $$
DECLARE
  speaking_pool jsonb[] := ARRAY[
    '{"type":"speaking","title":"Keynote: Future of Financial Advisory","organization":"Global Finance Summit","year":2024}'::jsonb,
    '{"type":"speaking","title":"Panel: Cross-Border Tax Compliance Strategies","organization":"International Tax Forum","year":2024}'::jsonb,
    '{"type":"speaking","title":"Workshop: ESG Reporting & Regulatory Standards","organization":"World Economic Forum","year":2023}'::jsonb,
    '{"type":"speaking","title":"Roundtable: Digital Assets & Regulatory Frameworks","organization":"ICAEW Annual Conference","year":2024}'::jsonb,
    '{"type":"speaking","title":"Keynote: Transforming Legal Practice with Technology","organization":"LegalTech Asia","year":2023}'::jsonb,
    '{"type":"speaking","title":"Panel: Corporate Governance Best Practices","organization":"Deloitte CFO Summit","year":2024}'::jsonb,
    '{"type":"speaking","title":"Masterclass: Mergers & Acquisitions Due Diligence","organization":"PwC Leadership Forum","year":2023}'::jsonb,
    '{"type":"speaking","title":"Seminar: IFRS 17 Implementation for Insurers","organization":"Institute of Chartered Accountants","year":2022}'::jsonb
  ];
  publication_pool jsonb[] := ARRAY[
    '{"type":"publication","title":"Navigating Cross-Border Tax in a Post-BEPS World","organization":"International Tax Review","year":2024}'::jsonb,
    '{"type":"publication","title":"ESG Integration in Financial Reporting","organization":"Journal of Financial Reporting","year":2023}'::jsonb,
    '{"type":"publication","title":"The Rise of AI in Legal Compliance","organization":"Harvard Law Review","year":2024}'::jsonb,
    '{"type":"publication","title":"Forensic Accounting: Emerging Methodologies","organization":"ACFE Fraud Magazine","year":2023}'::jsonb,
    '{"type":"publication","title":"Transfer Pricing in the Digital Economy","organization":"Tax Notes International","year":2022}'::jsonb,
    '{"type":"publication","title":"Restructuring Frameworks Post-COVID: Lessons Learned","organization":"Insolvency & Restructuring Review","year":2023}'::jsonb,
    '{"type":"publication","title":"Wealth Management for HNWIs: A Holistic Approach","organization":"Financial Planning Journal","year":2024}'::jsonb,
    '{"type":"publication","title":"Cryptocurrency Taxation: A Practitioner''s Guide","organization":"Bloomberg Tax","year":2023}'::jsonb
  ];
  award_pool jsonb[] := ARRAY[
    '{"type":"award","title":"Top 40 Under 40 in Finance","organization":"Financial Times","year":2023}'::jsonb,
    '{"type":"award","title":"Best Tax Practitioner of the Year","organization":"International Tax Review","year":2022}'::jsonb,
    '{"type":"award","title":"Excellence in Legal Advisory","organization":"Legal 500","year":2023}'::jsonb,
    '{"type":"award","title":"Emerging Leader in Financial Services","organization":"CFA Institute","year":2023}'::jsonb,
    '{"type":"award","title":"Most Innovative Compliance Practitioner","organization":"Compliance Week","year":2024}'::jsonb,
    '{"type":"award","title":"Distinguished Fellow Award","organization":"ACCA Global","year":2022}'::jsonb,
    '{"type":"award","title":"Client Choice Award — Finance & Tax","organization":"International Law Office","year":2023}'::jsonb
  ];
  media_pool jsonb[] := ARRAY[
    '{"type":"media","title":"Featured Expert: Bloomberg Markets Weekly","organization":"Bloomberg","year":2024}'::jsonb,
    '{"type":"media","title":"Interview: CNBC Fast Money — Tax Reform Impact","organization":"CNBC","year":2023}'::jsonb,
    '{"type":"media","title":"Quoted Expert: The Economist on Digital Regulation","organization":"The Economist","year":2024}'::jsonb,
    '{"type":"media","title":"Podcast Guest: The Financial Planning Hour","organization":"Spotify Podcasts","year":2024}'::jsonb,
    '{"type":"media","title":"Contributor: Forbes Finance Council","organization":"Forbes","year":2023}'::jsonb,
    '{"type":"media","title":"Op-Ed: Why Global Minimum Tax Changes Everything","organization":"Financial Times","year":2023}'::jsonb
  ];
  rec RECORD;
  si integer;
  pi integer;
  ai integer;
  mi integer;
  engs jsonb;
BEGIN
  FOR rec IN SELECT id, slug FROM members LOOP
    -- Use hash of slug to pick deterministic but varied entries
    si := (abs(hashtext(rec.slug || 'sp')) % array_length(speaking_pool, 1)) + 1;
    pi := (abs(hashtext(rec.slug || 'pu')) % array_length(publication_pool, 1)) + 1;
    ai := (abs(hashtext(rec.slug || 'aw')) % array_length(award_pool, 1)) + 1;
    mi := (abs(hashtext(rec.slug || 'me')) % array_length(media_pool, 1)) + 1;

    -- Build 5 engagements: 2 speaking, 1 publication, 1 award, 1 media
    engs := jsonb_build_array(
      speaking_pool[si] || jsonb_build_object('id', gen_random_uuid()::text),
      speaking_pool[(si % array_length(speaking_pool, 1)) + 1] || jsonb_build_object('id', gen_random_uuid()::text),
      publication_pool[pi] || jsonb_build_object('id', gen_random_uuid()::text),
      award_pool[ai] || jsonb_build_object('id', gen_random_uuid()::text),
      media_pool[mi] || jsonb_build_object('id', gen_random_uuid()::text)
    );

    UPDATE members SET engagements = engs WHERE id = rec.id;
  END LOOP;
END;
$$;
