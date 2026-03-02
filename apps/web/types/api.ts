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

export interface ServiceCategory {
  id: string;
  name: string;
  domain?: string;
  isActive?: boolean;
}

export interface Service {
  id: string;
  name: string;
  sortOrder?: number;
  category?: ServiceCategory;
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
  startYear: number;
  endYear?: number;
  isCurrent?: boolean;
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
  name: string;
  issuingBody?: string;
  isVerified?: boolean;
  year?: number;
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
  designation?: string;
  city?: string;
  country?: string;
  isVerified?: boolean;
  memberTier?: string;
  firmName?: string;
  primaryService?: MemberPrimaryService;
  user: MemberUser;
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
  firmWebsite?: string;
  linkedinUrl?: string;
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
  serviceCategory?: { id: string; name: string };
  author?: ArticleAuthor;
}

export interface ArticleFull extends ArticleListItem {
  body: string;
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
  shortDescription?: string;
  description?: string;
  format?: string; // 'online' | 'in_person' | 'hybrid'
  country?: string;
  city?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  registrationUrl?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  regions?: string[];
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
  consultationRequests: boolean;
  articleStatus: boolean;
  membershipReminders: boolean;
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
  frequency: 'weekly' | 'fortnightly';
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
  firstName?: string;
  lastName?: string;
  designation?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  profilePhotoUrl?: string;
  firmName?: string;
  firmSize?: string;
  country?: string;
  city?: string;
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
  qualifications?: string[];
  credentials?: Credential[];
  workExperience?: WorkExperience[];
  education?: Education[];
  primaryServiceId?: string;
  secondaryServiceIds?: string[];
  engagements?: Engagement[];
  availability?: Availability;
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
  designation?: string;
  headline?: string;
  bio?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  membershipTier?: string;
  membershipExpiryAt?: string;
  linkedinUrl?: string;
  profilePhotoUrl?: string;
  country?: string;
  city?: string;
  pendingServiceId?: string;
  pendingReVerification?: boolean;
  userId?: string;
  credentials?: Credential[];
  createdAt: string;
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

export interface Seat {
  id: string;
  categoryId?: string;
  serviceId?: string;
  capacity: number;
  claimedCount: number;
  isActive?: boolean;
  createdAt: string;
}

export interface OpsEvent {
  id: string;
  slug?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  format?: string;
  country?: string;
  city?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  registrationUrl?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  regions?: string[];
  tags?: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface BroadcastLog {
  id: string;
  subject: string;
  message?: string;
  recipientCount: number;
  sentAt: string;
}
