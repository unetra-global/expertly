/**
 * Onboarding Zustand store
 * Persists to sessionStorage so data survives page refreshes but is cleared
 * when the browser tab is closed.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Entry sub-types ───────────────────────────────────────────────────────────

export interface WorkExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number | '';
  endYear: number | '';
}

export interface CredentialEntry {
  id: string;
  name: string;
  institution: string;
  year: number | '';
  documentUrl: string;
  uploading?: boolean;
}

export interface EngagementEntry {
  id: string;
  type: 'speaking' | 'publication' | 'award' | 'media';
  title: string;
  organization: string;
  year: number | '';
  url: string;
}

export interface AvailabilityData {
  days: string[];
  timeSlots: string[];
  timezone: string;
  responseTime: '24h' | '48h' | '1week' | '';
  preferredContact: string[];
  notes: string;
}

// ── Step-level form data types ────────────────────────────────────────────────

export interface Step1Data {
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  designation: string;
  headline: string;
  bio: string;
  linkedinUrl: string;
}

export interface Step2Data {
  yearsOfExperience: number | '';
  firmName: string;
  firmSize: string;
  country: string;
  city: string;
  consultationFeeMinUsd: number | '';
  consultationFeeMaxUsd: number | '';
  qualifications: string[];
  credentials: CredentialEntry[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
}

export interface Step3Data {
  primaryServiceId: string;
  secondaryServiceIds: string[];
  engagements: EngagementEntry[];
  availability: AvailabilityData;
  consentTerms: boolean;
  consentVerification: boolean;
}

export type OnboardingFormData = Step1Data & Step2Data & Step3Data;

// ── LinkedIn prefill result shape ─────────────────────────────────────────────

export interface LinkedInPrefillResult {
  name?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  designation?: string;
  experience?: Array<{
    firm: string;
    title: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
}

// ── Store shape ───────────────────────────────────────────────────────────────

interface OnboardingState {
  formData: OnboardingFormData;
  currentStep: 1 | 2 | 3;
  applicationId: string | null;
  linkedInPrefillApplied: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

interface OnboardingActions {
  setStep1: (data: Partial<Step1Data>) => void;
  setStep2: (data: Partial<Step2Data>) => void;
  setStep3: (data: Partial<Step3Data>) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setApplicationId: (id: string) => void;
  setIsSubmitting: (val: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  applyLinkedInPrefill: (result: LinkedInPrefillResult) => void;
  resetForm: () => void;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultFormData: OnboardingFormData = {
  // Step 1
  firstName: '',
  lastName: '',
  profilePhotoUrl: '',
  designation: '',
  headline: '',
  bio: '',
  linkedinUrl: '',
  // Step 2
  yearsOfExperience: '',
  firmName: '',
  firmSize: '',
  country: '',
  city: '',
  consultationFeeMinUsd: '',
  consultationFeeMaxUsd: '',
  qualifications: [],
  credentials: [],
  workExperience: [],
  education: [],
  // Step 3
  primaryServiceId: '',
  secondaryServiceIds: [],
  engagements: [],
  availability: {
    days: [],
    timeSlots: [],
    timezone: '',
    responseTime: '',
    preferredContact: [],
    notes: '',
  },
  consentTerms: false,
  consentVerification: false,
};

const initialState: OnboardingState = {
  formData: defaultFormData,
  currentStep: 1,
  applicationId: null,
  linkedInPrefillApplied: false,
  isSubmitting: false,
  errors: {},
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep1: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

      setStep2: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

      setStep3: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

      setStep: (step) => set({ currentStep: step }),

      setApplicationId: (id) => set({ applicationId: id }),

      setIsSubmitting: (val) => set({ isSubmitting: val }),

      setErrors: (errors) => set({ errors }),

      clearErrors: () => set({ errors: {} }),

      /**
       * applyLinkedInPrefill — TDD Section 22 merge logic:
       *   • Only populate empty fields — never overwrite manual input
       *   • country, yearsOfExperience, consultationFeeMinUsd are NEVER overwritten
       */
      applyLinkedInPrefill: (result) => {
        const { formData } = get();
        const updates: Partial<OnboardingFormData> = {};

        // firstName / lastName
        if (!formData.firstName && result.firstName) {
          updates.firstName = result.firstName;
        }
        if (!formData.lastName && result.lastName) {
          updates.lastName = result.lastName;
        }
        // Fallback: parse full name if individual parts absent
        if (!formData.firstName && !result.firstName && result.name) {
          const parts = result.name.trim().split(/\s+/);
          updates.firstName = parts[0] ?? '';
          if (!formData.lastName && parts.length > 1) {
            updates.lastName = parts.slice(1).join(' ');
          }
        }

        if (!formData.headline && result.headline) {
          updates.headline = result.headline.slice(0, 120);
        }
        if (!formData.bio && result.bio) {
          updates.bio = result.bio.slice(0, 500);
        }
        if (!formData.linkedinUrl && result.linkedinUrl) {
          updates.linkedinUrl = result.linkedinUrl;
        }
        if (!formData.designation && result.designation) {
          updates.designation = result.designation;
        }

        // Work experience — only populate if list is currently empty
        if (
          formData.workExperience.length === 0 &&
          result.experience &&
          result.experience.length > 0
        ) {
          updates.workExperience = result.experience.slice(0, 5).map((exp, i) => ({
            id: `li-${i}`,
            title: exp.title ?? '',
            company: exp.firm ?? '',
            startDate: exp.startDate ?? '',
            endDate: exp.endDate ?? '',
            isCurrent: exp.isCurrent ?? false,
          }));
        }

        // NEVER overwrite: country, yearsOfExperience, consultationFeeMinUsd

        set((state) => ({
          formData: { ...state.formData, ...updates },
          linkedInPrefillApplied: true,
        }));
      },

      resetForm: () => set({ ...initialState }),
    }),
    {
      name: 'expertly-onboarding',
      storage: createJSONStorage(() => {
        // SSR guard — sessionStorage is not available on the server
        if (typeof window !== 'undefined') return window.sessionStorage;
        return {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        };
      }),
    },
  ),
);
