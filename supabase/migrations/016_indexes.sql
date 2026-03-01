-- Performance indexes

-- users
CREATE INDEX idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- members
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_slug ON members(slug);
CREATE INDEX idx_members_membership_status ON members(membership_status);
CREATE INDEX idx_members_embedding ON members USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Text search indexes on members
CREATE INDEX idx_members_headline_trgm ON members USING gin (headline gin_trgm_ops);
CREATE INDEX idx_members_bio_trgm ON members USING gin (bio gin_trgm_ops);

-- member_services
CREATE INDEX idx_member_services_member_id ON member_services(member_id);
CREATE INDEX idx_member_services_service_id ON member_services(service_id);

-- services
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_is_active ON services(is_active);

-- applications
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- articles
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_tags ON articles USING gin (tags);
CREATE INDEX idx_articles_embedding ON articles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_articles_title_trgm ON articles USING gin (title gin_trgm_ops);

-- events
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date ASC);
CREATE INDEX idx_events_embedding ON events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- consultation_requests
CREATE INDEX idx_consultation_requester_id ON consultation_requests(requester_id);
CREATE INDEX idx_consultation_member_id ON consultation_requests(member_id);
CREATE INDEX idx_consultation_status ON consultation_requests(status);
CREATE INDEX idx_consultation_created_at ON consultation_requests(created_at DESC);

-- background_jobs
CREATE INDEX idx_bg_jobs_status ON background_jobs(status);
CREATE INDEX idx_bg_jobs_type ON background_jobs(type);
CREATE INDEX idx_bg_jobs_created_at ON background_jobs(created_at DESC);

-- regulatory_updates
CREATE INDEX idx_regulatory_published_at ON regulatory_updates(published_at DESC);
CREATE INDEX idx_regulatory_is_active ON regulatory_updates(is_active);

-- digest subscriptions
CREATE INDEX idx_digest_subs_email ON user_digest_subscriptions(email);
CREATE INDEX idx_digest_subs_is_active ON user_digest_subscriptions(is_active);

-- consent_log
CREATE INDEX idx_consent_user_id ON consent_log(user_id);
CREATE INDEX idx_consent_type ON consent_log(consent_type);

-- email_logs
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);
