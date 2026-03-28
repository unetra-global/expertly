/**
 * Shared TypeScript interfaces for API responses.
 * All fields are camelCased (ResponseInterceptor converts snake_case automatically).
 */

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Taxonomy ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  domain?: string;
  isActive?: boolean;
}

export interface Service {
  id: string;
  name: string;
  sortOrder?: number;
  category?: Category;
}

// ── Members ───────────────────────────────────────────────────────────────────

export interface MemberUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

export interface MemberPrimaryService {
  id: string;
  name: string;
  category?: { id: string; name: string };
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  // Onboarding form stores YYYY-MM strings; legacy stored numeric years
  startDate?: string;
  endDate?: string;
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  website?: string;
  city?: string;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startYear?: number;
  endYear?: number;
}

export interface Qualification {
  id: string;
  name: string;
  issuingBody?: string;
  year?: number;
}

export interface Credential {
  id: string;
  // Onboarding form stores qualificationName; legacy stored name
  name?: string;
  qualificationName?: string;
  abbreviation?: string;
  issuingBody?: string;
  isVerified?: boolean;
  year?: number | '';
  // Onboarding form stores documentUrl; legacy stored url
  documentUrl?: string;
  url?: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle?: string;
  content: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Engagement {
  id: string;
  type: 'speaking' | 'publication' | 'award' | 'media';
  title: string;
  organization?: string;
  year?: number;
  url?: string;
}

/** Minimal shape returned in list/directory views */
export interface MemberListItem {
  id: string;
  slug: string;
  profilePhotoUrl?: string;
  avatarUrl?: string;
  designation?: string;
  city?: string;
  country?: string;
  isVerified?: boolean;
  memberTier?: string;
  firmName?: string;
  primaryServiceId?: string;
  /** Supabase join — plural because of the FK relationship name */
  users?: { firstName?: string; lastName?: string; fullName?: string; email?: string; profilePhotoBase64?: string };
  /** Joined primary service (categories is the join from categories table) */
  services?: { id?: string; name?: string; categories?: { id?: string; name?: string } };
  // Authenticated-only fields (omitted by API for guests)
  headline?: string;
  yearsOfExperience?: number;
  feeRangeMin?: number;
  feeRangeMax?: number;
  feeCurrency?: string;
}

/** Full shape returned by /members/:slug */
export interface MemberFullProfile extends MemberListItem {
  bio?: string;
  website?: string;
  firmWebsite?: string;
  firmName?: string;
  linkedinUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  availabilityNotes?: string;
  isAvailable?: boolean;
  secondaryServices?: Array<{ id: string; name: string }>;
  workExperiences?: WorkExperience[];
  educations?: Education[];
  qualifications?: Qualification[];
  credentials?: Credential[];
  testimonials?: Testimonial[];
  engagements?: Engagement[];
  updatedAt?: string;
}

// ── Articles ──────────────────────────────────────────────────────────────────

export interface ArticleAuthor {
  id?: string;
  slug: string;
  profilePhotoUrl?: string;
  designation?: string;
  headline?: string;
  city?: string;
  country?: string;
  memberTier?: string;
  primaryService?: { name: string };
  user: MemberUser;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  readTimeMinutes?: number;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
  category?: { id: string; name: string };
  author?: ArticleAuthor;
}

export interface ArticleFull extends ArticleListItem {
  body: string;
  aiSummary?: string;
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface EventSpeaker {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  photoUrl?: string;
}

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** DB column: event_format → camelCased to eventFormat */
  eventFormat?: string; // 'online' | 'in_person' | 'hybrid'
  eventType?: string;
  country?: string;
  city?: string;
  /** DB column: venue_name → camelCased to venueName */
  venueName?: string;
  startDate: string;
  endDate?: string;
  registrationUrl?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface EventFull extends EventListItem {
  speakers?: EventSpeaker[];
}

// ── Applications ──────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted';

export interface ApplicationDraft {
  id: string;
  status: ApplicationStatus;
  currentStep?: 1 | 2 | 3;
  rejectionReason?: string;
  reApplicationEligibleAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Background Jobs ───────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BackgroundJob {
  id: string;
  type: string;
  status: JobStatus;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Member Portal — extended types ────────────────────────────────────────────

export interface Availability {
  days: string[];
  slots: string[];
  timezone: string;
  responseTime: string;
  preferredContact: string[];
  notes?: string;
}

export interface NotificationPreferences {
  articleStatus: boolean;
  regulatoryNudges: boolean;
  platformUpdates: boolean;
}

/** Full member profile returned by GET /members/me (authenticated) */
export interface MemberMe extends MemberFullProfile {
  isFeatured?: boolean;
  firmSize?: string;
  membershipExpiryAt?: string;
  membershipTier?: string;
  isVerifiedPending?: boolean;
  availability?: Availability;
  notificationPreferences?: NotificationPreferences;
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
}

// ── Articles — member-facing ───────────────────────────────────────────────────

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'published'
  | 'rejected'
  | 'archived';

export interface MemberArticle {
  id: string;
  slug?: string;
  title?: string;
  body?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status: ArticleStatus;
  wordCount?: number;
  tags?: string[];
  rejectionReason?: string;
  submittedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  categoryId?: string;
  viewCount?: number;
  isAiAssisted?: boolean;
}

// ── Consultation ───────────────────────────────────────────────────────────────

export interface ConsultationRequest {
  id: string;
  subject: string;
  description?: string;
  preferredTime?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requesterName?: string;
  requesterEmail?: string;
  serviceName?: string;
  createdAt: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export interface DashboardStats {
  profileCompletion: number;
  publishedArticlesCount: number;
  totalArticleViews: number;
  consultationRequestsCount: number;
  membershipExpiryAt?: string;
  membershipTier?: string;
  isVerified: boolean;
  isVerifiedPending?: boolean;
  memberSlug?: string;
  recentConsultationRequests: ConsultationRequest[];
  recentArticles: MemberArticle[];
}

// ── Digest ─────────────────────────────────────────────────────────────────────

export interface DigestSubscription {
  categoryId: string;
  categoryName: string;
  isSubscribed: boolean;
  frequency: 'daily' | 'weekly' | 'fortnightly';
}

// ── Ops Dashboard ──────────────────────────────────────────────────────────────

export interface OpsStats {
  totalApplications: number;
  totalMembers: number;
  totalArticles: number;
  totalEvents: number;
  pendingApplications?: number;
  pendingArticles?: number;
  pendingReVerification?: number;
  expiringIn30Days?: number;
}

export interface OpsApplication {
  id: string;
  userId: string;
  status: string;
  currentStep?: number;
  // Step 1 — personal & contact
  firstName?: string;
  lastName?: string;
  designation?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  profilePhotoUrl?: string;
  profilePhotoBase64?: string;
  region?: string;
  state?: string;
  city?: string;
  country?: string;
  phoneExtension?: string;
  phone?: string;
  contactEmail?: string;
  // Step 2 — professional background
  yearsOfExperience?: number;
  firmName?: string;
  firmSize?: string;
  websiteUrl?: string;
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
  qualifications?: string[];
  credentials?: Credential[];
  workExperience?: WorkExperience[];
  education?: Education[];
  // Step 3 — services & engagements
  primaryServiceId?: string;
  secondaryServiceIds?: string[];
  keyEngagements?: string[];
  engagements?: Engagement[];
  availability?: Availability;
  // Step 4 — motivation
  motivationWhy?: string;
  motivationEngagement?: string;
  motivationUnique?: string;
  // Review
  membershipTier?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reApplicationEligibleAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpsMember {
  id: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  designation?: string;
  headline?: string;
  bio?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  membershipTier?: string;
  membershipStartDate?: string;
  membershipExpiryAt?: string;
  linkedinUrl?: string;
  profilePhotoUrl?: string;
  profilePhotoBase64?: string;
  country?: string;
  city?: string;
  region?: string;
  state?: string;
  contactPhone?: string;
  contactEmail?: string;
  firmName?: string;
  firmSize?: string;
  website?: string;
  yearsOfExperience?: number;
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
  qualifications?: string;
  credentials?: Credential[];
  workExperience?: WorkExperience[];
  education?: Education[];
  testimonials?: Testimonial[];
  engagements?: Engagement[];
  primaryServiceId?: string;
  keyEngagements?: string[];
  motivationWhy?: string;
  motivationEngagement?: string;
  motivationUnique?: string;
  pendingServiceId?: string;
  pendingReVerification?: boolean;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OpsArticle {
  id: string;
  title?: string;
  slug?: string;
  body?: string;
  excerpt?: string;
  status: string;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  creationMode?: 'ai' | 'manual';
  submittedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}


export interface OpsEvent {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  /** DB: event_format → camelCased to eventFormat */
  eventFormat?: string;
  country?: string;
  city?: string;
  /** DB: venue_name → camelCased to venueName */
  venueName?: string;
  /** DB: start_date → camelCased to startDate */
  startDate: string;
  /** DB: end_date → camelCased to endDate */
  endDate?: string;
  registrationUrl?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface OpsUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface BroadcastLog {
  id: string;
  subject: string;
  message?: string;
  recipientCount: number;
  sentAt: string;
}

// ── AI Search ──────────────────────────────────────────────────────────────────

export interface SearchParsedQuery {
  intent: 'members' | 'articles' | 'events' | 'all';
  cleanQuery: string;
  filters: {
    city?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
    serviceCategory?: string;
    isVirtual?: boolean;
  };
}

export interface SearchMemberResult {
  id: string;
  slug: string;
  designation?: string;
  headline?: string;
  profilePhotoUrl?: string;
  city?: string;
  country?: string;
  memberTier?: string;
  isVerified?: boolean;
  users?: { firstName?: string; lastName?: string };
  services?: { name: string };
}

export interface SearchArticleResult {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  publishedAt?: string;
  readTime?: number;
  tags?: string[];
}

export interface SearchEventResult {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  city?: string;
  country?: string;
  isVirtual?: boolean;
  status?: string;
}

export interface AiSearchResponse {
  members: SearchMemberResult[];
  articles: SearchArticleResult[];
  events: SearchEventResult[];
  parsedQuery?: SearchParsedQuery;
}
