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
  website?: string;  // company website URL
  city?: string;
  firmSize?: string;
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
  qualificationTypeId: string; // taxonomy id, or 'other' for free-text
  qualificationName: string;   // full name (from taxonomy or user-entered)
  abbreviation: string;        // short form badge, e.g. CA, CFA (from taxonomy or user-entered)
  issuingBody: string;         // pre-filled from taxonomy or user-entered
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
  startHour: number;
  endHour: number;
  timezone: string;
  notes: string;
}

// ── Step-level form data types ────────────────────────────────────────────────

export interface Step1Data {
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  profilePhotoBase64: string;
  designation: string;
  headline: string;
  bio: string;
  linkedinUrl: string;
  region: string;
  country: string;
  state: string;
  city: string;
  phoneExtension: string;
  phone: string;
  contactEmail: string;
}

export interface Step2Data {
  yearsOfExperience: number | '';
  firmName: string;
  firmSize: string;
  firmWebsiteUrl: string;  // website of current employer, derived from work experience
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
  keyEngagements: string[];
  engagements: EngagementEntry[];
  availability: AvailabilityData;
}

export type OnboardingFormData = Step1Data & Step2Data & Step3Data;

// ── LinkedIn prefill result shape ─────────────────────────────────────────────

export interface LinkedInPrefillResult {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  designation?: string;
  city?: string;
  country?: string;
  state?: string;
  profilePhotoUrl?: string;
  experience?: Array<{
    firm: string;
    title: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    city?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear?: number | '';
    endYear?: number | '';
  }>;
}

// ── Store shape ───────────────────────────────────────────────────────────────

interface OnboardingState {
  formData: OnboardingFormData;
  currentStep: 1 | 2 | 3 | 4;
  applicationId: string | null;
  linkedInPrefillApplied: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

interface OnboardingActions {
  setStep1: (data: Partial<Step1Data>) => void;
  setStep2: (data: Partial<Step2Data>) => void;
  setStep3: (data: Partial<Step3Data>) => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
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
  profilePhotoBase64: '',
  designation: '',
  headline: '',
  bio: '',
  linkedinUrl: '',
  region: '',
  country: '',
  state: '',
  city: '',
  phoneExtension: '',
  phone: '',
  contactEmail: '',
  // Step 2
  yearsOfExperience: '',
  firmName: '',
  firmSize: '',
  firmWebsiteUrl: '',
  consultationFeeMinUsd: '',
  consultationFeeMaxUsd: '',
  qualifications: [],
  credentials: [],
  workExperience: [],
  education: [],
  // Step 3
  primaryServiceId: '',
  secondaryServiceIds: [],
  keyEngagements: [],
  engagements: [],
  availability: {
    days: [],
    startHour: 9,
    endHour: 17,
    timezone: '',
    notes: '',
  },
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

        if (!formData.city && result.city) updates.city = result.city;
        if (!formData.profilePhotoUrl && result.profilePhotoUrl) {
          updates.profilePhotoUrl = result.profilePhotoUrl;
        }
        if (!formData.country && result.country) {
          updates.country = result.country;
          if (!formData.state && result.state) updates.state = result.state;
          if (!formData.region) {
            const COUNTRY_REGION: Record<string, string> = {
              Australia: 'asia_pacific', China: 'asia_pacific', 'Hong Kong': 'asia_pacific',
              Indonesia: 'asia_pacific', Japan: 'asia_pacific', Malaysia: 'asia_pacific',
              'New Zealand': 'asia_pacific', Philippines: 'asia_pacific', Singapore: 'asia_pacific',
              'South Korea': 'asia_pacific', Thailand: 'asia_pacific', Vietnam: 'asia_pacific',
              Belgium: 'europe', Denmark: 'europe', Finland: 'europe', France: 'europe',
              Germany: 'europe', Greece: 'europe', Ireland: 'europe', Italy: 'europe',
              Netherlands: 'europe', Norway: 'europe', Poland: 'europe', Portugal: 'europe',
              Spain: 'europe', Sweden: 'europe', Switzerland: 'europe', Turkey: 'europe',
              'United Kingdom': 'europe',
              Argentina: 'latin_america', Brazil: 'latin_america', Chile: 'latin_america',
              Colombia: 'latin_america', Mexico: 'latin_america', Peru: 'latin_america',
              Bahrain: 'middle_east', Israel: 'middle_east', Jordan: 'middle_east',
              Kuwait: 'middle_east', Oman: 'middle_east', Qatar: 'middle_east',
              'Saudi Arabia': 'middle_east', 'United Arab Emirates': 'middle_east',
              Canada: 'north_america', 'United States': 'north_america',
              Bangladesh: 'south_asia', India: 'south_asia', Nepal: 'south_asia',
              Pakistan: 'south_asia', 'Sri Lanka': 'south_asia',
              Egypt: 'africa', Ghana: 'africa', Kenya: 'africa', Mauritius: 'africa',
              Morocco: 'africa', Nigeria: 'africa', Rwanda: 'africa', 'South Africa': 'africa',
              Tanzania: 'africa', Uganda: 'africa', Zimbabwe: 'africa',
            };
            const r = COUNTRY_REGION[result.country];
            if (r) updates.region = r;
          }
        }

        // Work experience — only populate if list is currently empty
        if (formData.workExperience.length === 0 && result.experience?.length) {
          updates.workExperience = result.experience.slice(0, 5).map((exp, i) => ({
            id: `li-${i}`,
            title: exp.title ?? '',
            company: exp.firm ?? '',
            city: exp.city ?? '',
            startDate: exp.startDate ?? '',
            endDate: exp.endDate ?? '',
            isCurrent: exp.isCurrent ?? false,
          }));
        }

        // Education — only populate if list is currently empty
        if (formData.education.length === 0 && result.education?.length) {
          updates.education = result.education.slice(0, 3).map((edu, i) => ({
            id: `li-edu-${i}`,
            institution: edu.institution ?? '',
            degree: edu.degree ?? '',
            field: edu.field ?? '',
            startYear: edu.startYear ?? '',
            endYear: edu.endYear ?? '',
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
      version: 7, // bumped: motivation step removed
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
