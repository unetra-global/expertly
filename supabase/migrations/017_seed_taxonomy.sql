-- Seed: Service Categories and Services
-- This represents the taxonomy of professional services offered on Expertly

-- ─── Service Categories ───────────────────────────────────────────────────────
INSERT INTO service_categories (id, name, slug, description, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Legal & Compliance',     'legal-compliance',      'Legal advisory, regulatory compliance, and corporate governance', 1),
  ('10000000-0000-0000-0000-000000000002', 'Finance & Accounting',   'finance-accounting',    'Financial planning, accounting, tax, and investment advisory',     2),
  ('10000000-0000-0000-0000-000000000003', 'Strategy & Management',  'strategy-management',   'Business strategy, operations, and executive advisory',             3),
  ('10000000-0000-0000-0000-000000000004', 'Technology & Engineering','technology-engineering','Software engineering, architecture, and IT strategy',              4),
  ('10000000-0000-0000-0000-000000000005', 'Marketing & Growth',     'marketing-growth',      'Brand strategy, digital marketing, and growth advisory',            5),
  ('10000000-0000-0000-0000-000000000006', 'HR & People',            'hr-people',             'Human resources, talent acquisition, and organisational culture',   6),
  ('10000000-0000-0000-0000-000000000007', 'Investment & VC',        'investment-vc',         'Venture capital, angel investing, and fundraising advisory',         7),
  ('10000000-0000-0000-0000-000000000008', 'Data & Analytics',       'data-analytics',        'Data strategy, analytics, and business intelligence',               8)
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Legal & Compliance ────────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000001', 'Corporate Law',              'corporate-law',              'Advice on company formation, governance, and M&A'),
  ('20000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000001', 'Regulatory Compliance',      'regulatory-compliance',      'Navigating sector-specific regulations and compliance frameworks'),
  ('20000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000001', 'Employment Law',             'employment-law',             'Workplace legal matters, contracts, and dispute resolution'),
  ('20000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000001', 'IP & Technology Law',        'ip-technology-law',          'Intellectual property strategy, patents, and tech contracts'),
  ('20000000-0000-0000-0000-000000000105', '10000000-0000-0000-0000-000000000001', 'Data Privacy & GDPR',        'data-privacy-gdpr',          'Data protection law and privacy programme design')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Finance & Accounting ──────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000002', 'CFO Advisory',               'cfo-advisory',               'Fractional CFO and senior financial leadership'),
  ('20000000-0000-0000-0000-000000000202', '10000000-0000-0000-0000-000000000002', 'Tax Strategy',               'tax-strategy',               'Corporate and personal tax planning and optimisation'),
  ('20000000-0000-0000-0000-000000000203', '10000000-0000-0000-0000-000000000002', 'Financial Modelling',        'financial-modelling',        'Business models, forecasts, and scenario planning'),
  ('20000000-0000-0000-0000-000000000204', '10000000-0000-0000-0000-000000000002', 'Fundraising & Investor Relations', 'fundraising-ir',       'Pitch deck preparation, investor introductions, due diligence'),
  ('20000000-0000-0000-0000-000000000205', '10000000-0000-0000-0000-000000000002', 'Audit & Assurance',          'audit-assurance',            'Internal audit, risk assessment, and financial controls')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Strategy & Management ─────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000301', '10000000-0000-0000-0000-000000000003', 'Business Strategy',          'business-strategy',          'Market entry, growth strategy, and competitive positioning'),
  ('20000000-0000-0000-0000-000000000302', '10000000-0000-0000-0000-000000000003', 'Operations Management',      'operations-management',      'Process optimisation, supply chain, and operational efficiency'),
  ('20000000-0000-0000-0000-000000000303', '10000000-0000-0000-0000-000000000003', 'Executive Coaching',         'executive-coaching',         'Leadership development and C-suite advisory'),
  ('20000000-0000-0000-0000-000000000304', '10000000-0000-0000-0000-000000000003', 'Board Advisory',             'board-advisory',             'Non-executive director and board governance advisory'),
  ('20000000-0000-0000-0000-000000000305', '10000000-0000-0000-0000-000000000003', 'Change Management',          'change-management',          'Organisational transformation and change programme delivery')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Technology & Engineering ──────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000004', 'CTO Advisory',               'cto-advisory',               'Fractional CTO and technical leadership'),
  ('20000000-0000-0000-0000-000000000402', '10000000-0000-0000-0000-000000000004', 'Software Architecture',      'software-architecture',      'System design, microservices, and scalability advisory'),
  ('20000000-0000-0000-0000-000000000403', '10000000-0000-0000-0000-000000000004', 'AI & Machine Learning',      'ai-machine-learning',        'AI strategy, model development, and MLOps'),
  ('20000000-0000-0000-0000-000000000404', '10000000-0000-0000-0000-000000000004', 'Cybersecurity',              'cybersecurity',              'Security strategy, penetration testing, and risk management'),
  ('20000000-0000-0000-0000-000000000405', '10000000-0000-0000-0000-000000000004', 'Cloud & DevOps',             'cloud-devops',               'Cloud migration, infrastructure, and CI/CD pipelines')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Marketing & Growth ────────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000005', 'CMO Advisory',               'cmo-advisory',               'Fractional CMO and marketing strategy'),
  ('20000000-0000-0000-0000-000000000502', '10000000-0000-0000-0000-000000000005', 'Brand Strategy',             'brand-strategy',             'Brand positioning, identity, and messaging'),
  ('20000000-0000-0000-0000-000000000503', '10000000-0000-0000-0000-000000000005', 'Digital Marketing',          'digital-marketing',          'SEO, paid acquisition, and conversion optimisation'),
  ('20000000-0000-0000-0000-000000000504', '10000000-0000-0000-0000-000000000005', 'Content Strategy',           'content-strategy',           'Content marketing, editorial strategy, and thought leadership'),
  ('20000000-0000-0000-0000-000000000505', '10000000-0000-0000-0000-000000000005', 'Product Marketing',          'product-marketing',          'Go-to-market strategy and product positioning')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: HR & People ────────────────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000006', 'CHRO Advisory',              'chro-advisory',              'Chief People Officer and HR strategy'),
  ('20000000-0000-0000-0000-000000000602', '10000000-0000-0000-0000-000000000006', 'Talent Acquisition',         'talent-acquisition',         'Executive search, hiring strategy, and recruitment process'),
  ('20000000-0000-0000-0000-000000000603', '10000000-0000-0000-0000-000000000006', 'Culture & Engagement',       'culture-engagement',         'Workplace culture, DEI initiatives, and employee engagement'),
  ('20000000-0000-0000-0000-000000000604', '10000000-0000-0000-0000-000000000006', 'Compensation & Benefits',    'compensation-benefits',      'Salary benchmarking, equity structures, and benefits design'),
  ('20000000-0000-0000-0000-000000000605', '10000000-0000-0000-0000-000000000006', 'Learning & Development',     'learning-development',       'Training strategy, L&D programmes, and leadership development')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Investment & VC ────────────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000701', '10000000-0000-0000-0000-000000000007', 'Angel Investment Advisory',  'angel-investment',           'Angel deal flow, due diligence, and portfolio management'),
  ('20000000-0000-0000-0000-000000000702', '10000000-0000-0000-0000-000000000007', 'VC Fund Advisory',           'vc-fund-advisory',           'Fund strategy, LP relations, and portfolio company support'),
  ('20000000-0000-0000-0000-000000000703', '10000000-0000-0000-0000-000000000007', 'Startup Fundraising',        'startup-fundraising',        'Seed to Series B fundraising strategy and execution'),
  ('20000000-0000-0000-0000-000000000704', '10000000-0000-0000-0000-000000000007', 'M&A Advisory',               'ma-advisory',                'Mergers, acquisitions, and exit strategy'),
  ('20000000-0000-0000-0000-000000000705', '10000000-0000-0000-0000-000000000007', 'Private Equity',             'private-equity',             'PE deal evaluation, value creation, and portfolio operations')
ON CONFLICT (id) DO NOTHING;

-- ─── Services: Data & Analytics ───────────────────────────────────────────────
INSERT INTO services (id, category_id, name, slug, description) VALUES
  ('20000000-0000-0000-0000-000000000801', '10000000-0000-0000-0000-000000000008', 'Data Strategy',              'data-strategy',              'Data architecture, governance, and roadmap'),
  ('20000000-0000-0000-0000-000000000802', '10000000-0000-0000-0000-000000000008', 'Business Intelligence',      'business-intelligence',      'BI tooling, dashboards, and reporting strategy'),
  ('20000000-0000-0000-0000-000000000803', '10000000-0000-0000-0000-000000000008', 'Data Engineering',           'data-engineering',           'Data pipelines, warehousing, and ETL architecture'),
  ('20000000-0000-0000-0000-000000000804', '10000000-0000-0000-0000-000000000008', 'Analytics Advisory',         'analytics-advisory',         'Product analytics, experimentation, and growth metrics'),
  ('20000000-0000-0000-0000-000000000805', '10000000-0000-0000-0000-000000000008', 'AI/Data Science',            'ai-data-science',            'Predictive modelling, NLP, and applied AI')
ON CONFLICT (id) DO NOTHING;
