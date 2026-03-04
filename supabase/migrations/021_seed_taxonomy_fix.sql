-- Audit 2: Replace incorrect generic taxonomy with spec-compliant
-- finance/legal taxonomy per MASTER_TDD.md Section 9.
--
-- The prior seed (017) used generic advisory categories (CTO Advisory,
-- CMO Advisory, etc.). The spec defines 8 finance/legal categories.
--
-- Strategy: clear derived data safely, then re-seed.

-- 1. Clear referencing data (safe for dev/staging)
DELETE FROM member_services;
UPDATE applications SET assigned_service_id = NULL WHERE assigned_service_id IS NOT NULL;

-- 2. Clear existing taxonomy
DELETE FROM services;
DELETE FROM service_categories;

-- ─── Service Categories (spec Section 9) ─────────────────────────────────────
-- Map spec short IDs ('cat-001') to stable UUIDs
-- Format: 00000000-0000-0000-0000-00000000000X

INSERT INTO service_categories (id, name, slug, domain, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Direct Tax',          'direct-tax',       'finance', 1, true),
  ('00000000-0000-0000-0000-000000000002', 'Indirect Tax',        'indirect-tax',     'finance', 2, true),
  ('00000000-0000-0000-0000-000000000003', 'Accounting',          'accounting',       'finance', 3, true),
  ('00000000-0000-0000-0000-000000000004', 'Audit & Assurance',   'audit-assurance',  'finance', 4, true),
  ('00000000-0000-0000-0000-000000000005', 'Corporate Law',       'corporate-law',    'legal',   5, true),
  ('00000000-0000-0000-0000-000000000006', 'Legal Services',      'legal-services',   'legal',   6, true),
  ('00000000-0000-0000-0000-000000000007', 'Legal - Industries',  'legal-industries', 'legal',   7, true),
  ('00000000-0000-0000-0000-000000000008', 'Others',              'others',           'both',    8, true);

-- ─── Direct Tax ───────────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Corporate Tax',                'corporate-tax',     1, true),
  ('00000000-0000-0000-0000-000000000001', 'Transfer Pricing',             'transfer-pricing',  2, true),
  ('00000000-0000-0000-0000-000000000001', 'International Tax',            'international-tax', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'M&A Tax',                      'ma-tax',            4, true),
  ('00000000-0000-0000-0000-000000000001', 'Tax Compliances',              'tax-compliances',   5, true),
  ('00000000-0000-0000-0000-000000000001', 'Tax Litigation',               'tax-litigation',    6, true),
  ('00000000-0000-0000-0000-000000000001', 'Estate & Succession Planning', 'estate-succession', 7, true);

-- ─── Indirect Tax ─────────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, regions, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000002', 'GST Advisory',    'gst-advisory',  ARRAY['IN'],       1, true),
  ('00000000-0000-0000-0000-000000000002', 'GST Compliance',  'gst-compliance',ARRAY['IN'],       2, true),
  ('00000000-0000-0000-0000-000000000002', 'GST Litigation',  'gst-litigation',ARRAY['IN'],       3, true),
  ('00000000-0000-0000-0000-000000000002', 'Customs & Trade', 'customs-trade', NULL,              4, true),
  ('00000000-0000-0000-0000-000000000002', 'VAT Advisory',    'vat-advisory',  ARRAY['AE','UK'],  5, true),
  ('00000000-0000-0000-0000-000000000002', 'Excise & Duties', 'excise-duties', NULL,              6, true);

-- ─── Accounting ───────────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Bookkeeping',          'bookkeeping',         1, true),
  ('00000000-0000-0000-0000-000000000003', 'Financial Reporting',  'financial-reporting', 2, true),
  ('00000000-0000-0000-0000-000000000003', 'Management Accounts',  'management-accounts', 3, true),
  ('00000000-0000-0000-0000-000000000003', 'Payroll',              'payroll',             4, true),
  ('00000000-0000-0000-0000-000000000003', 'Virtual CFO',          'virtual-cfo',         5, true);

-- ─── Audit & Assurance ────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Statutory Audit', 'statutory-audit', 1, true),
  ('00000000-0000-0000-0000-000000000004', 'Internal Audit',  'internal-audit',  2, true),
  ('00000000-0000-0000-0000-000000000004', 'Due Diligence',   'due-diligence',   3, true),
  ('00000000-0000-0000-0000-000000000004', 'Forensic Audit',  'forensic-audit',  4, true);

-- ─── Corporate Law ────────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Company Incorporation', 'company-incorporation', 1, true),
  ('00000000-0000-0000-0000-000000000005', 'Corporate Governance',  'corporate-governance',  2, true),
  ('00000000-0000-0000-0000-000000000005', 'M&A Advisory',          'ma-advisory',           3, true),
  ('00000000-0000-0000-0000-000000000005', 'Securities Law',        'securities-law',        4, true),
  ('00000000-0000-0000-0000-000000000005', 'Regulatory Compliance', 'regulatory-compliance', 5, true);

-- ─── Legal Services ───────────────────────────────────────────────────────────
INSERT INTO services (category_id, name, slug, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000006', 'Contract Drafting',     'contract-drafting',     1, true),
  ('00000000-0000-0000-0000-000000000006', 'Dispute Resolution',    'dispute-resolution',    2, true),
  ('00000000-0000-0000-0000-000000000006', 'Employment Law',        'employment-law',        3, true),
  ('00000000-0000-0000-0000-000000000006', 'Intellectual Property', 'intellectual-property', 4, true),
  ('00000000-0000-0000-0000-000000000006', 'Real Estate Law',       'real-estate-law',       5, true);

-- ─── Legal - Industries & Others (no services in spec; categories remain) ────
-- cat-007 and cat-008 are reserved — services will be added as the platform grows.
