'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const error = searchParams.get('error');
  const authError = searchParams.get('authError');
  const redirectedRef = useRef(false);

  // Check if there's a returnTo param and save it
  useEffect(() => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }
  }, [searchParams]);

  async function handleLinkedInSignIn() {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    setLoading(true);

    // Save current page as returnTo so we can redirect back after auth
    if (!sessionStorage.getItem('returnTo')) {
      const from = document.referrer
        ? new URL(document.referrer).pathname
        : null;
      if (from && from !== '/auth') {
        sessionStorage.setItem('returnTo', from);
      }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const supabase = getBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        scopes: 'openid profile email',
      },
    });
  }

  const errorMessage =
    error === 'account_suspended'
      ? 'Your account has been suspended. Please contact support.'
      : authError === 'oauth_failed'
        ? 'Authentication failed. Please try again.'
        : null;

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-navy opacity-5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-blue opacity-5" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1 text-3xl font-bold">
            <span className="text-brand-navy">Expertly</span>
            <span className="text-brand-blue">.</span>
          </span>
          <p className="mt-3 text-base text-gray-500 leading-relaxed">
            The professional network for finance&nbsp;&amp;&nbsp;legal experts
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
          <h1 className="text-xl font-semibold text-brand-navy mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to access your account or apply for membership.
          </p>

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* LinkedIn Button */}
          <button
            onClick={handleLinkedInSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0077B5] hover:bg-[#006097] active:bg-[#005580] text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Redirecting to LinkedIn…</span>
              </>
            ) : (
              <>
                {/* LinkedIn icon */}
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>Continue with LinkedIn</span>
              </>
            )}
          </button>

          <p className="mt-6 text-xs text-center text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-brand-navy">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-brand-navy">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Apply CTA */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Not a member yet?{' '}
          <a
            href="/application"
            className="font-medium text-brand-blue hover:text-brand-blue-dark"
          >
            Apply for membership →
          </a>
        </p>
      </div>
    </div>
  );
}
