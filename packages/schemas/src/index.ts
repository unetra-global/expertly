import { z } from 'zod';
import { countWords } from '../../utils/src/index';

// ─── Application Schemas ─────────────────────────────────────────────────────

/** Step 1: Personal Information */
export const ApplicationStep1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

/** Step 2: Professional Background */
export const ApplicationStep2Schema = z.object({
  headline: z
    .string()
    .min(10, 'Headline must be at least 10 characters')
    .max(150, 'Headline must be at most 150 characters'),
  bio: z
    .string()
    .min(100, 'Bio must be at least 100 characters')
    .max(2000, 'Bio must be at most 2000 characters'),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'Years of experience cannot be negative')
    .max(60, 'Years of experience seems too high'),
  primaryCategoryId: z.string().uuid('Must be a valid category ID'),
  serviceIds: z
    .array(z.string().uuid())
    .min(1, 'Select at least 1 service')
    .max(10, 'Select at most 10 services'),
});

/** Step 3: Fit Questions */
export const ApplicationStep3Schema = z.object({
  whyJoin: z
    .string()
    .min(50, 'Please provide at least 50 characters')
    .max(1000, 'Must be at most 1000 characters'),
  valueProposition: z
    .string()
    .min(50, 'Please provide at least 50 characters')
    .max(1000, 'Must be at most 1000 characters'),
  referralSource: z.string().optional(),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms of service' }),
  }),
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
  coverImageUrl: z.string().url().optional(),
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
  headline: z
    .string()
    .min(10)
    .max(150)
    .optional(),
  bio: z.string().min(50).max(2000).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
  twitterUrl: z.string().url().optional().nullable().or(z.literal('')),
  githubUrl: z.string().url().optional().nullable().or(z.literal('')),
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
  engagement: z
    .object({
      openToConsultation: z.boolean(),
      openToMentoring: z.boolean(),
      speakingTopics: z.array(z.string()).max(10).optional(),
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
  location: z.string().max(200).optional(),
  isVirtual: z.boolean().default(false),
  virtualUrl: z.string().url().optional(),
  capacity: z.number().int().min(1).optional(),
  registrationUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  speakers: z
    .array(
      z.object({
        memberId: z.string().uuid().optional(),
        name: z.string().min(1),
        title: z.string().min(1),
        company: z.string().optional(),
        avatarUrl: z.string().url().optional(),
        bio: z.string().max(500).optional(),
      }),
    )
    .default([]),
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
