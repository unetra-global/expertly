'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase';

type AuthTab = 'signin' | 'signup';
type AuthMethod = 'linkedin' | 'email';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Honour ?tab=signup from e.g. "Become a Member" nav link or ?tab=signin
  const initialTab: AuthTab =
    searchParams?.get('tab') === 'signup' ? 'signup' : 'signin';

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [method, setMethod] = useState<AuthMethod>('linkedin');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreateSuggestion, setShowCreateSuggestion] = useState(false);
  const [signUpConfirmPending, setSignUpConfirmPending] = useState(false);
  const redirectedRef = useRef(false);

  const error = searchParams?.get('error');
  const authError = searchParams?.get('authError');

  // Redirect already-authenticated users away from the auth page.
  // Pass returnTo as ?next= so the redirect route can honour it for new users.
  useEffect(() => {
    const returnTo = searchParams?.get('returnTo');
    getBrowserClient().auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const dest = returnTo
          ? `/auth/redirect?next=${encodeURIComponent(returnTo)}`
          : '/auth/redirect';
        router.replace(dest);
      } else {
        setSessionChecked(true);
      }
    });
  }, [router, searchParams]);

  // Reset form state when switching tabs or methods
  useEffect(() => {
    setFormError(null);
    setShowCreateSuggestion(false);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  }, [tab, method]);

  async function handleLinkedInAuth(intent: AuthTab) {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    setLoading(true);

    const supabase = getBrowserClient();
    const origin = (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin).replace(/\/$/, '');
    const returnTo = searchParams?.get('returnTo');

    // Store the post-auth destination in a short-lived cookie BEFORE the
    // OAuth redirect. This is the only reliable mechanism for LinkedIn OIDC —
    // the provider strips custom query parameters (like ?next=) from the
    // redirectTo URL during the OAuth round-trip, so embedding the destination
    // in the URL is not sufficient. Cookies survive the full browser redirect
    // chain independently.
    //
    // Sign-in with no explicit returnTo → go to home page after auth.
    // Sign-up with no explicit returnTo → no cookie → callback defaults to /onboarding.
    if (returnTo) {
      setRedirectCookie(returnTo);
    } else if (intent === 'signin') {
      setRedirectCookie('/');
    }

    // The callbackUrl intentionally omits ?next= — the cookie above is the
    // authoritative source. The Supabase allowlist only needs the bare callback
    // URL for LinkedIn OAuth.
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: 'openid profile email',
      },
    });
  }

  async function handleEmailAuth(intent: AuthTab) {
    setFormError(null);
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    if (intent === 'signup') {
      if (!firstName.trim()) { setFormError('Please enter your first name.'); return; }
      if (!lastName.trim()) { setFormError('Please enter your last name.'); return; }
    }

    setLoading(true);
    const supabase = getBrowserClient();
    const returnTo = searchParams?.get('returnTo');

    if (intent === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setLoading(false);
        if (signInError.message.toLowerCase().includes('invalid login')) {
          setFormError("We couldn't find an account with those credentials.");
          setShowCreateSuggestion(true);
        } else {
          setFormError(signInError.message);
        }
        return;
      }
    } else {
      const origin = (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin).replace(/\/$/, '');

      // Set the cookie for same-device email confirmation (best-effort).
      // The emailRedirectTo ?next= param below covers cross-device confirmation.
      if (returnTo) {
        setRedirectCookie(returnTo);
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Keep ?next= in emailRedirectTo so it works when the user confirms
          // their email on a different device (where the cookie won't be present).
          // Do NOT encodeURIComponent — Supabase exact-matches the allowlist.
          emailRedirectTo: returnTo
            ? `${origin}/auth/callback?next=${returnTo}`
            : `${origin}/auth/callback`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (signUpError) {
        setLoading(false);
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setFormError('An account with this email already exists. Please sign in.');
        } else {
          setFormError(signUpError.message);
        }
        return;
      }

      // Email confirmation required — no session yet
      if (!signUpData.session) {
        setLoading(false);
        setSignUpConfirmPending(true);
        return;
      }
    }

    // Redirect to server route that checks role/application and routes accordingly.
    // Pass ?next= so new users land on the right page after sign-in/sign-up.
    // Use window.location.href (full browser navigation) instead of router.push
    // because router.push does a SPA fetch to the Route Handler and may not
    // follow the HTTP redirect response properly in all Next.js versions.
    //
    // Sign-in with no returnTo → pass next=/ so the redirect route sends the
    // user to the home page instead of /onboarding.
    // Sign-up with no returnTo → no next param → redirect route defaults to /onboarding.
    const dest = returnTo
      ? `/auth/redirect?next=${encodeURIComponent(returnTo)}`
      : intent === 'signin'
        ? '/auth/redirect?next=%2F'
        : '/auth/redirect';
    window.location.href = dest;
  }

  const errorMessage =
    error === 'account_suspended'
      ? 'Your account has been suspended. Please contact support.'
      : authError === 'oauth_failed'
        ? 'Authentication failed. Please try again.'
        : null;

  if (!sessionChecked) {
    return <div className="min-h-screen bg-brand-navy" />;
  }

  return (
    <div className="min-h-screen bg-brand-navy flex">
      {/* ── Left panel — branding / value props (desktop only) ──── */}
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
        {/* Blue radial glow */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[400px] bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden
        />

        {/* Logo */}
        <div className="relative inline-flex items-baseline gap-0.5">
          <span className="text-2xl font-black text-white tracking-tight">Expertly</span>
          <span className="text-2xl font-black text-brand-gold">.</span>
        </div>

        {/* Value props */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug">
              The global network for<br />
              <span className="text-brand-blue-light">finance &amp; legal</span><br />
              professionals.
            </h2>
            <p className="mt-4 text-white/60 text-base leading-relaxed max-w-sm">
              Connect with verified experts, publish thought leadership, and
              access exclusive events — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '500+', label: 'Verified Experts' },
              { value: '40+', label: 'Countries' },
              { value: '1,200+', label: 'Articles' },
              { value: '3,800+', label: 'Consultations' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-xs text-white/30">
          © {new Date().getFullYear()} Expertly. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — auth card ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-brand-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-baseline justify-center gap-0.5 mb-8">
            <span className="text-2xl font-black text-brand-navy tracking-tight">Expertly</span>
            <span className="text-2xl font-black text-brand-gold">.</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            {/* ── Tab switcher ──────────────────────────────── */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab('signin')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signin'
                    ? 'text-brand-navy border-b-2 border-brand-blue -mb-px bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-brand-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signup'
                    ? 'text-brand-navy border-b-2 border-brand-blue -mb-px bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-brand-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="px-8 py-8">
              {/* Error banner */}
              {(errorMessage || formError) && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {errorMessage ?? formError}
                  {showCreateSuggestion && (
                    <span>
                      {' '}
                      <button
                        onClick={() => setTab('signup')}
                        className="font-semibold underline hover:text-red-900"
                      >
                        Create an account
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* ── Sign In tab ─────────────────────────── */}
              {tab === 'signin' && (
                <>
                  <h1 className="text-xl font-bold text-brand-navy mb-1">
                    Welcome back
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">
                    Sign in to your Expertly account to continue.
                  </p>

                  {/* Method toggle */}
                  <div className="flex rounded-lg border border-gray-200 p-0.5 mb-6 bg-gray-50">
                    <button
                      onClick={() => setMethod('linkedin')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        method === 'linkedin'
                          ? 'bg-white text-brand-navy shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setMethod('email')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        method === 'email'
                          ? 'bg-white text-brand-navy shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Email
                    </button>
                  </div>

                  {method === 'linkedin' ? (
                    <button
                      onClick={() => void handleLinkedInAuth('signin')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0077B5] hover:bg-[#006097] active:bg-[#005580] text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Spinner />
                          <span>Redirecting to LinkedIn…</span>
                        </>
                      ) : (
                        <>
                          <LinkedInIcon />
                          <span>Continue with LinkedIn</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => { e.preventDefault(); void handleEmailAuth('signin'); }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Password
                        </label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                      >
                        {loading ? <><Spinner /><span>Signing in…</span></> : 'Sign in with Email'}
                      </button>
                    </form>
                  )}

                  <p className="mt-6 text-sm text-center text-gray-500">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => setTab('signup')}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      Create one
                    </button>
                  </p>
                </>
              )}

              {/* ── Sign Up / Create Account tab ────────── */}
              {tab === 'signup' && signUpConfirmPending && (
                <div className="py-4 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-brand-navy">Check your email</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We sent a confirmation link to <span className="font-medium text-brand-navy">{email}</span>.
                    Click it to activate your account, then come back to sign in.
                  </p>
                  <button
                    onClick={() => { setSignUpConfirmPending(false); setTab('signin'); }}
                    className="mt-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {tab === 'signup' && !signUpConfirmPending && (
                <>
                  <h1 className="text-xl font-bold text-brand-navy mb-1">
                    Join Expertly
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">
                    Create your account and apply for verified membership.
                  </p>

                  {/* Method toggle */}
                  <div className="flex rounded-lg border border-gray-200 p-0.5 mb-6 bg-gray-50">
                    <button
                      onClick={() => setMethod('linkedin')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        method === 'linkedin'
                          ? 'bg-white text-brand-navy shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setMethod('email')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                        method === 'email'
                          ? 'bg-white text-brand-navy shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Email
                    </button>
                  </div>

                  {method === 'linkedin' ? (
                    <>
                      <button
                        onClick={() => void handleLinkedInAuth('signup')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#0077B5] hover:bg-[#006097] active:bg-[#005580] text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Spinner />
                            <span>Redirecting to LinkedIn…</span>
                          </>
                        ) : (
                          <>
                            <LinkedInIcon />
                            <span>Sign up with LinkedIn</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <form
                      onSubmit={(e) => { e.preventDefault(); void handleEmailAuth('signup'); }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            First name
                          </label>
                          <input
                            type="text"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Last name
                          </label>
                          <input
                            type="text"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Smith"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Password
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3.5 px-6 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                      >
                        {loading ? <><Spinner /><span>Creating account…</span></> : 'Create Account with Email'}
                      </button>
                    </form>
                  )}

                  <p className="mt-5 text-sm text-center text-gray-500">
                    Already have an account?{' '}
                    <button
                      onClick={() => setTab('signin')}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Legal */}
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

/**
 * Write a short-lived first-party cookie that the server-side /auth/callback
 * route handler can read to determine where to send the user after OAuth.
 *
 * Why a cookie instead of a URL param?
 * LinkedIn OIDC strips custom query parameters (e.g. ?next=) from the
 * redirectTo URL during its OAuth redirect chain. Cookies are sent with
 * every same-site request regardless of how the browser arrived at the URL,
 * so they reliably survive the full OAuth round-trip.
 *
 * SameSite=Lax is intentional: it allows the cookie to be sent when the
 * browser follows a cross-site top-level redirect (i.e. Supabase → our
 * callback URL), which is exactly the OAuth completion scenario.
 */
function setRedirectCookie(path: string) {
  const parts = [
    `post_auth_redirect=${encodeURIComponent(path)}`,
    'Path=/',
    'SameSite=Lax',
    'Max-Age=600', // 10 minutes — more than enough for any OAuth flow
  ];
  // Only add Secure on HTTPS to allow local dev over HTTP
  if (window.location.protocol === 'https:') {
    parts.push('Secure');
  }
  document.cookie = parts.join('; ');
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
