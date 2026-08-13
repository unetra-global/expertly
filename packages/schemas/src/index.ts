import { z } from 'zod';

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const CredentialSchema = z.object({
  id: z.string(),
  qualificationTypeId: z.string(),
  qualificationName: z.string().min(1),
  abbreviation: z.string(),
  issuingBody: z.string(),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  documentUrl: z.string().optional(),
});

const WorkExperienceSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  company: z.string().min(1),
  website: z.string().url().optional().or(z.literal('')),
  city: z.string().optional(),
  firmSize: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
});

const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  startYear: z.number().int().min(1950),
  endYear: z.number().int().optional(),
});

const AchievementSchema = z.object({
  id: z.string(),
  type: z.enum(['speaking', 'publication', 'award', 'media']),
  title: z.string().min(1),
  organization: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  url: z.string().url().optional().or(z.literal('')),
});

// ─── Application Schemas ─────────────────────────────────────────────────────

/** Step 1: Identity */
export const ApplicationStep1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  designation: z.string().min(2, 'Designation is required'),
  headline: z.string().min(10).max(150),
  bio: z.string().min(100).max(2000),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
  region: z.string().min(1, 'Region is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  phoneExtension: z.string().optional(),
  phone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

/** Step 2: Experience & Rates */
export const ApplicationStep2Schema = z.object({
  yearsOfExperience: z.number().int().min(0).max(60),
  firmName: z.string().optional(),
  firmSize: z.string().optional(),
  firmWebsiteUrl: z.string().url().optional().or(z.literal('')),
  consultationFeeMinUsd: z.number().min(0),
  consultationFeeMaxUsd: z.number().min(0).optional(),
  qualifications: z.array(z.string()).default([]),
  credentials: z.array(CredentialSchema).default([]),
  workExperience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
}).refine(
  (d) => d.consultationFeeMaxUsd === undefined || d.consultationFeeMaxUsd === 0 || d.consultationFeeMaxUsd > d.consultationFeeMinUsd,
  { message: 'Maximum fee must be greater than minimum fee', path: ['consultationFeeMaxUsd'] },
);

/** Step 3: Services & Highlights */
export const ApplicationStep3Schema = z.object({
  primaryServiceId: z.string().uuid('Primary service is required'),
  secondaryServiceIds: z.array(z.string().uuid()).max(2).default([]),
  achievements: z.array(AchievementSchema).default([]),
  careerHighlights: z
    .array(z.string().min(1).max(200))
    .max(5, 'Maximum 5 highlights')
    .default([]),
  availability: z.record(z.unknown()).optional(),
});

// ─── Article Schema ───────────────────────────────────────────────────────────

export const ArticleCreateSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be at most 200 characters'),
  body: z.string().refine(
    (val) => countWords(val) >= 300,
    { message: 'Article body must be at least 300 words' },
  ),
  excerpt: z.string().max(300, 'Excerpt must be at most 300 characters').optional(),
  featuredImageUrl: z.string().url().optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .default([]),
  status: z.enum(['draft', 'published']).default('draft'),
});

// ─── Consultation Request Schema ──────────────────────────────────────────────

export const ConsultationRequestSchema = z.object({
  memberId: z.string().uuid('Must be a valid member ID'),
  serviceId: z.string().uuid('Must be a valid service ID').optional(),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be at most 1000 characters'),
  scheduledAt: z.string().datetime().optional(),
});

// ─── Member Update Schema ─────────────────────────────────────────────────────

export const MemberUpdateSchema = z.object({
  // Profile
  designation: z.string().min(2).max(100).optional(),
  headline: z.string().min(10).max(150).optional(),
  bio: z.string().min(50).max(2000).optional(),
  profilePhotoUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
  // Location
  city: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  // Firm
  firmName: z.string().optional().nullable(),
  firmSize: z.string().optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  // Rates
  consultationFeeMinUsd: z.number().min(0).optional(),
  consultationFeeMaxUsd: z.number().min(0).optional().nullable(),
  // Professional details
  qualifications: z.array(z.string()).optional(),
  credentials: z.array(CredentialSchema).optional(),
  workExperience: z.array(WorkExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  achievements: z.array(AchievementSchema).optional(),
  careerHighlights: z
    .array(z.string().min(1).max(200))
    .max(5, 'Maximum 5 highlights')
    .optional(),
  // Availability
  availability: z
    .object({
      timezone: z.string(),
      hoursPerWeek: z.number().min(0).max(168),
      slots: z
        .array(
          z.object({
            day: z.enum([
              'monday', 'tuesday', 'wednesday', 'thursday',
              'friday', 'saturday', 'sunday',
            ]),
            from: z.string().regex(/^\d{2}:\d{2}$/),
            to: z.string().regex(/^\d{2}:\d{2}$/),
          }),
        )
        .optional(),
    })
    .optional(),
});

// ─── Event Create Schema ──────────────────────────────────────────────────────

export const EventCreateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  coverImageUrl: z.string().url().optional(),
  startDate: z.string().datetime('Must be a valid datetime'),
  endDate: z.string().datetime('Must be a valid datetime'),
  isVirtual: z.boolean().default(false),
  virtualUrl: z.string().url().optional(),
  registrationUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

// ─── Exported Types ───────────────────────────────────────────────────────────

export type ApplicationStep1 = z.infer<typeof ApplicationStep1Schema>;
export type ApplicationStep2 = z.infer<typeof ApplicationStep2Schema>;
export type ApplicationStep3 = z.infer<typeof ApplicationStep3Schema>;
export type ArticleCreate = z.infer<typeof ArticleCreateSchema>;
export type ConsultationRequestInput = z.infer<typeof ConsultationRequestSchema>;
export type MemberUpdate = z.infer<typeof MemberUpdateSchema>;
export type EventCreate = z.infer<typeof EventCreateSchema>;
