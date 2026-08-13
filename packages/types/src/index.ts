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

export interface Achievement {
  type: 'award' | 'speaking' | 'publication' | 'media';
  title: string;
  organization?: string;
  year?: number;
  url?: string;
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

// ─── Enums (mirroring DB enums) ─────────────────────────────────────────────

export type UserRole = 'user' | 'member' | 'ops' | 'backend_admin';

export type MemberTier = 'budding_professional' | 'seasoned_professional';

export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'cancelled';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export type ConsultationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

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
  // Profile
  designation?: string;
  headline: string;
  bio: string;
  profilePhotoUrl?: string;
  website?: string;
  linkedinUrl?: string;
  // Location
  city?: string;
  country?: string;
  region?: string;
  state?: string;
  contactPhone?: string;
  contactEmail?: string;
  // Membership
  memberTier: 'budding_professional' | 'seasoned_professional';
  membershipStatus: MembershipStatus;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  isVerified: boolean;
  verifiedAt?: string;
  isFeatured: boolean;
  // Professional
  primaryServiceId?: string;
  yearsOfExperience?: number;
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
  firmName?: string;
  firmSize?: string;
  qualifications: string[];
  credentials: Credential[];
  testimonials: Testimonial[];
  workExperience: WorkExperience[];
  education: Education[];
  achievements: Achievement[];
  careerHighlights: string[];
  availability?: Availability;
  // Timestamps
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
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  // joined
  category?: Category;
}

export interface MemberService {
  id: string;
  memberId: string;
  serviceId: string;
  isPrimary: boolean;
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
  featuredImageUrl?: string;
  tags: string[];
  status: ArticleStatus;
  readTimeMinutes: number;
  publishedAt?: string;
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
  isVirtual: boolean;
  virtualUrl?: string;
  status: EventStatus;
  registrationUrl?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  organizer?: Member;
}

export interface Application {
  id: string;
  userId: string;
  // Step 1 — Identity
  firstName?: string;
  lastName?: string;
  designation?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  profilePhotoUrl?: string;
  region?: string;
  country?: string;
  state?: string;
  city?: string;
  phoneExtension?: string;
  phone?: string;
  contactEmail?: string;
  // Step 2 — Experience
  yearsOfExperience?: number;
  firmName?: string;
  firmSize?: string;
  websiteUrl?: string;
  qualifications?: string[];
  credentials?: Credential[];
  workExperience?: WorkExperience[];
  education?: Education[];
  consultationFeeMinUsd?: number;
  consultationFeeMaxUsd?: number;
  // Step 3 — Services
  primaryServiceId?: string;
  secondaryServiceIds?: string[];
  achievements?: Achievement[];
  careerHighlights?: string[];
  availability?: Availability;
  // Workflow
  creationMode?: string;
  currentStep: number;
  status: ApplicationStatus;
  membershipTier?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reApplicationEligibleAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  user?: User;
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
