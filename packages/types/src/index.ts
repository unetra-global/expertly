// ─── JSONB Sub-interfaces ───────────────────────────────────────────────────

export interface Availability {
  timezone: string;
  hoursPerWeek: number;
  slots: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    from: string; // HH:MM
    to: string;   // HH:MM
  }[];
}

export interface Engagement {
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  speakingTopics?: string[];
  openToConsultation: boolean;
  openToMentoring: boolean;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string; // ISO date
  expiresAt?: string;
  verificationUrl?: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  authorCompany?: string;
  content: string;
  givenAt: string; // ISO date
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate?: string;  // YYYY-MM or null for current
  isCurrent: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
}

export interface Speaker {
  memberId?: string;
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  bio?: string;
}

// ─── Enums (mirroring DB enums) ─────────────────────────────────────────────

export type UserRole = 'user' | 'member' | 'ops' | 'backend_admin';

export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'cancelled';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export type ConsultationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'marketing';

// ─── Core interfaces ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  supabaseUid: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  slug: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  website?: string;
  linkedinUrl?: string;
  membershipStatus: MembershipStatus;
  seatId?: string;
  availability?: Availability;
  engagement?: Engagement;
  credentials: Credential[];
  testimonials: Testimonial[];
  workExperience: WorkExperience[];
  education: Education[];
  embedding?: number[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  // joined from users
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  // joined
  category?: Category;
}

export interface MemberService {
  id: string;
  memberId: string;
  serviceId: string;
  feeFrom?: number;
  feeTo?: number;
  feeCurrency: string;
  description?: string;
  createdAt: string;
  // joined
  service?: Service;
}

export interface SeatAllocation {
  id: string;
  memberId: string;
  seatNumber: number;
  allocatedAt: string;
  releasedAt?: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags: string[];
  status: ArticleStatus;
  viewCount: number;
  readTime: number;
  publishedAt?: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
  // joined
  author?: Member;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  virtualUrl?: string;
  capacity?: number;
  status: EventStatus;
  speakers: Speaker[];
  embedding?: number[];
  registrationUrl?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  organizer?: Member;
}

export interface Application {
  id: string;
  userId: string;
  // Step 1: personal info
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  // Step 2: professional
  headline: string;
  bio: string;
  yearsOfExperience: number;
  primaryCategoryId: string;
  serviceIds: string[];
  // Step 3: fit questions
  whyJoin: string;
  valueProposition: string;
  referralSource?: string;
  agreedToTerms: boolean;
  // Meta
  status: ApplicationStatus;
  reviewerId?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  user?: User;
  primaryCategory?: Category;
}

export interface ConsultationRequest {
  id: string;
  requesterId: string;
  memberId: string;
  serviceId?: string;
  message: string;
  status: ConsultationStatus;
  scheduledAt?: string;
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  requester?: User;
  member?: Member;
  service?: Service;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;           // Supabase UID
  dbId: string;         // users.id in DB
  email: string;
  role: UserRole;
  memberId?: string;    // members.id if role === 'member'
  membershipStatus?: MembershipStatus;
}

// ─── API Response wrappers ───────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    path: string;
    timestamp: string;
  };
}
