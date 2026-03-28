'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { ApplicationDraft } from '@/types/api';

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ── Status state components ───────────────────────────────────────────────────

function SubmittedState({ app }: { app: ApplicationDraft }) {
  return (
    <div className="text-center">
      {/* Animated pulse ring */}
      <div className="relative inline-flex mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="absolute top-0 right-0 block w-5 h-5 rounded-full bg-green-400 border-2 border-white animate-ping" />
        <span className="absolute top-0 right-0 block w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-xs font-semibold text-green-700 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Under Review
      </div>
      <h2 className="text-2xl font-bold text-brand-navy mb-3">
        Your application is under review
      </h2>
      <p className="text-brand-text-secondary text-base leading-relaxed max-w-md mx-auto mb-6">
        Our team will review your application within{' '}
        <strong className="text-brand-navy">5 business days</strong>.
        You'll receive an email notification once a decision is made.
      </p>
      {app.submittedAt && (
        <p className="text-sm text-brand-text-muted">
          Submitted on {formatDate(app.submittedAt)}
        </p>
      )}
      <div className="mt-8 rounded-2xl bg-brand-surface border border-gray-100 p-5 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-brand-text-muted mb-3">WHAT HAPPENS NEXT</p>
        <ol className="space-y-3">
          {[
            'Our team reviews your credentials and background',
            'We may reach out for additional information',
            "You'll receive an email with our decision",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-brand-text-secondary">
              <span className="w-5 h-5 rounded-full bg-brand-blue-subtle border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-brand-blue">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ApprovedState() {
  return (
    <div className="text-center">
      <div className="relative inline-flex mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="h-10 w-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-700 mb-4">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Application Approved
      </div>
      <h2 className="text-2xl font-bold text-brand-navy mb-3">
        Your application has been approved!
      </h2>
      <p className="text-brand-text-secondary text-base leading-relaxed max-w-md mx-auto mb-2">
        Congratulations! Please check your email for payment instructions.
      </p>
      <p className="text-brand-text-secondary text-base leading-relaxed max-w-md mx-auto mb-6">
        Your account will be activated within{' '}
        <strong className="text-brand-navy">1 business day</strong>{' '}
        of payment confirmation.
      </p>
      <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-5 max-w-sm mx-auto text-left">
        <p className="text-xs font-semibold text-amber-700 mb-2">NEED HELP?</p>
        <p className="text-sm text-amber-800">
          Contact us at{' '}
          <a href="mailto:support@expertly.net" className="font-semibold underline hover:no-underline">
            support@expertly.net
          </a>
          {' '}if you have questions about payment or activation.
        </p>
      </div>
    </div>
  );
}

function WaitlistedState() {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6">
        <svg className="h-10 w-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-700 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Waitlisted
      </div>
      <h2 className="text-2xl font-bold text-brand-navy mb-3">You're on the waitlist</h2>
      <p className="text-brand-text-secondary text-base leading-relaxed max-w-md mx-auto mb-6">
        Your application was strong, but your service category is currently at capacity.
        We'll email you as soon as a seat opens for your service.
      </p>
      <div className="rounded-2xl bg-brand-surface border border-gray-100 p-5 max-w-sm mx-auto text-left">
        <p className="text-xs font-semibold text-brand-text-muted mb-2">WHAT TO EXPECT</p>
        <ul className="space-y-2 text-sm text-brand-text-secondary">
          <li className="flex items-start gap-2">
            <svg className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You have received a confirmation email with details
          </li>
          <li className="flex items-start gap-2">
            <svg className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You'll be notified immediately when a seat becomes available
          </li>
          <li className="flex items-start gap-2">
            <svg className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No action needed from you right now
          </li>
        </ul>
      </div>
    </div>
  );
}

function RejectedState({ app, onReapply }: { app: ApplicationDraft; onReapply: () => void }) {
  const now = new Date();
  const eligibleAt = app.reApplicationEligibleAt
    ? new Date(app.reApplicationEligibleAt)
    : null;
  const canReapply = eligibleAt ? eligibleAt <= now : false;

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-600 mb-4">
        Application Not Approved
      </div>
      <h2 className="text-2xl font-bold text-brand-navy mb-3">
        We couldn't approve your application
      </h2>
      <p className="text-brand-text-secondary text-base leading-relaxed max-w-md mx-auto mb-6">
        Thank you for your interest in Expertly. After careful review, we were unable
        to approve your application at this time.
      </p>

      {app.rejectionReason && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-5 max-w-md mx-auto text-left mb-6">
          <p className="text-xs font-semibold text-red-500 mb-2">FEEDBACK FROM OUR TEAM</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed">{app.rejectionReason}</p>
        </div>
      )}

      {eligibleAt && (
        <div className="mb-6">
          {canReapply ? (
            <div className="space-y-3">
              <p className="text-sm text-brand-text-secondary">
                You are now eligible to re-apply. We encourage you to address
                the feedback above before submitting a new application.
              </p>
              <button
                onClick={onReapply}
                className="btn-primary px-6 py-3"
              >
                Re-apply Now
              </button>
            </div>
          ) : (
            <p className="text-sm text-brand-text-muted">
              You may re-apply after{' '}
              <strong className="text-brand-navy">{formatDate(app.reApplicationEligibleAt)}</strong>.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-brand-surface border border-gray-100 p-5 max-w-sm mx-auto text-left">
        <p className="text-xs font-semibold text-brand-text-muted mb-2">HAVE QUESTIONS?</p>
        <p className="text-sm text-brand-text-secondary">
          Reach us at{' '}
          <a href="mailto:support@expertly.net" className="text-brand-blue hover:underline font-medium">
            support@expertly.net
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function StatusSkeleton() {
  return (
    <div className="animate-pulse text-center">
      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-6" />
      <div className="h-6 bg-gray-200 rounded-lg w-64 mx-auto mb-3" />
      <div className="h-4 bg-gray-100 rounded-lg w-80 mx-auto mb-2" />
      <div className="h-4 bg-gray-100 rounded-lg w-72 mx-auto" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ApplicationStatusPage() {
  const router = useRouter();

  const { data: application, isLoading } = useQuery<ApplicationDraft>({
    queryKey: ['application-status'],
    queryFn: () => apiClient.get<ApplicationDraft>('/applications/me'),
    refetchInterval: 30_000,
    retry: 2,
  });

  // Draft → resume form
  useEffect(() => {
    if (application?.status === 'draft') {
      router.replace('/application');
    }
  }, [application?.status, router]);

  function handleReapply() {
    router.push('/onboarding');
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Hero */}
      <div className="bg-brand-navy py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-2">Membership Application</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Application Status</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-10 sm:px-10 sm:py-14">
          {isLoading ? (
            <StatusSkeleton />
          ) : !application ? (
            <div className="text-center">
              <p className="text-brand-text-secondary mb-4">No application found.</p>
              <Link href="/onboarding" className="btn-primary px-6 py-3">
                Start Application
              </Link>
            </div>
          ) : application.status === 'submitted' || application.status === 'under_review' ? (
            <SubmittedState app={application} />
          ) : application.status === 'approved' ? (
            <ApprovedState />
          ) : application.status === 'waitlisted' ? (
            <WaitlistedState />
          ) : application.status === 'rejected' ? (
            <RejectedState app={application} onReapply={handleReapply} />
          ) : null}
        </div>

        {/* Polling note */}
        {!isLoading && application && (
          <p className="text-center text-xs text-brand-text-muted mt-4">
            Status refreshes automatically every 30 seconds
          </p>
        )}
      </div>
    </div>
  );
}
