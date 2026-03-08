import Link from 'next/link';

interface AuthWallProps {
  backHref?: string;
  backLabel?: string;
  description?: string;
  returnTo?: string;
}

export function AuthWall({
  backHref = '/members',
  backLabel = 'Back to Members',
  description = 'Sign in to view full member profiles, contact details, and professional credentials.',
  returnTo,
}: AuthWallProps) {
  const signInHref = returnTo ? `/auth?returnTo=${encodeURIComponent(returnTo)}` : '/auth';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
        <svg
          className="h-9 w-9 text-brand-blue"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-brand-navy mb-3 text-center">
        Authorized Users Only
      </h1>
      <p className="text-brand-text-secondary text-center max-w-sm mb-8 text-sm leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3">
        <Link
          href={signInHref}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth?tab=signup"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-brand-surface text-brand-navy font-semibold text-sm transition-colors"
        >
          Create Account
        </Link>
      </div>

      <Link
        href={backHref}
        className="mt-6 text-sm text-brand-text-muted hover:text-brand-navy transition-colors flex items-center gap-1"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backLabel}
      </Link>
    </div>
  );
}
