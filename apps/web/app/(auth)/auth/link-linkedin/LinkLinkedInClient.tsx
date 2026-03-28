'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase';

/**
 * /auth/link-linkedin
 *
 * Shown when an authenticated user tries to access /application but has no
 * LinkedIn identity linked (e.g., they were created via email/password by
 * an admin, or they signed up via another provider).
 *
 * The page verifies the user is logged in, then offers a single CTA that
 * calls supabase.auth.linkIdentity() to attach LinkedIn to their account.
 * After the OAuth round-trip the callback (/auth/callback) completes and
 * the identity is linked — subsequent visits to /application will succeed.
 */
export default function LinkLinkedInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const redirectedRef = useRef(false);

  // Verify the user is actually authenticated before rendering the CTA
  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Not logged in at all — send them to the sign-in page
        router.replace('/auth');
        return;
      }

      // Already has LinkedIn linked — send them straight to /application
      const hasLinkedIn =
        user.identities?.some((id) => id.provider === 'linkedin_oidc') ?? false;
      if (hasLinkedIn) {
        router.replace('/application');
        return;
      }

      setUserEmail(user.email ?? undefined);
      setChecking(false);
    });
  }, [router]);

  async function handleLinkLinkedIn() {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    setLoading(true);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const supabase = getBrowserClient();

    // linkIdentity attaches a new OAuth provider to the currently-signed-in
    // user without creating a new account. After the OAuth round-trip the
    // user is redirected back to /auth/callback which already handles cookies.
    const { error } = await supabase.auth.linkIdentity({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        scopes: 'openid profile email',
      },
    });

    if (error) {
      // linkIdentity redirects on success — only reaches here on error
      setLoading(false);
      redirectedRef.current = false;
      console.error('linkIdentity error:', error.message);
    }
  }

  // Loading skeleton while we verify auth state
  if (checking) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy flex">
      {/* Left branding panel (desktop) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[50%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div
          className="absolute top-0 left-0 w-[600px] h-[400px] bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none select-none">E</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Expertly</span>
        </div>

        {/* Explanation */}
        <div className="relative space-y-5 max-w-sm">
          <h2 className="text-3xl font-bold text-white leading-snug">
            One more step before<br />
            <span className="text-brand-blue-light">you can apply.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Expertly membership requires a verified LinkedIn identity so we
            can confirm your professional background. This is a one-time step.
          </p>
          <ul className="space-y-3">
            {[
              'Verifies your professional identity',
              'Enables background confirmation',
              'Required for all member applications',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-3 w-3 text-brand-blue-light" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/30">
          © {new Date().getFullYear()} Expertly. All rights reserved.
        </p>
      </div>

      {/* Right panel — action card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-brand-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none select-none">E</span>
            </div>
            <span className="text-brand-navy font-bold text-lg tracking-wide">Expertly</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-brand-blue-subtle border border-blue-100 flex items-center justify-center mx-auto mb-6">
              <svg className="h-7 w-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-brand-navy text-center mb-1">
              Connect Your LinkedIn
            </h1>
            <p className="text-sm text-gray-500 text-center mb-2">
              LinkedIn verification is required to apply for Expertly membership.
            </p>
            {userEmail && (
              <p className="text-xs text-center text-brand-text-muted mb-8">
                Linking to account: <span className="font-medium text-brand-text-secondary">{userEmail}</span>
              </p>
            )}

            {/* LinkedIn connect button */}
            <button
              onClick={() => void handleLinkLinkedIn()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0077B5] hover:bg-[#006097] active:bg-[#005580] text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Connecting to LinkedIn…</span>
                </>
              ) : (
                <>
                  <LinkedInIcon />
                  <span>Connect with LinkedIn</span>
                </>
              )}
            </button>

            {/* Info note */}
            <div className="mt-5 rounded-xl bg-brand-blue-subtle border border-blue-100 px-4 py-3 text-xs text-blue-700 leading-relaxed">
              This will link your LinkedIn profile to your existing Expertly
              account — it will not create a new account.
            </div>
          </div>

          <p className="mt-5 text-xs text-center text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-brand-navy">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-brand-navy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
