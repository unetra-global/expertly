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
