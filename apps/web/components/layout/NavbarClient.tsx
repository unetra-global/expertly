'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignOut } from '@/hooks/useAuth';

interface NavbarClientProps {
  userRole: string | null;
  userEmail?: string;
  userAvatarUrl?: string;
}

export function NavbarClient({
  userRole,
  userEmail,
  userAvatarUrl,
}: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const signOut = useSignOut();

  const isLoggedIn = userRole !== null;
  const isMember = userRole === 'member';
  const isOps = userRole === 'ops' || userRole === 'backend_admin';

  const initials = userEmail ? userEmail[0].toUpperCase() : 'U';

  const navLinks = [
    { href: '/members', label: 'Find Members' },
    { href: '/articles', label: 'Articles' },
    { href: '/events', label: 'Events' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-navy border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────── */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-brand-blue flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue-dark transition-colors">
            <span className="text-white font-bold text-sm leading-none select-none">E</span>
          </div>
          <span className="text-white font-bold text-base tracking-wide hidden sm:block">
            Expertly
          </span>
        </Link>

        {/* ── Desktop nav links ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Desktop right side ────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn && (
            <>
              <Link
                href="/auth"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2"
              >
                Log In
              </Link>
              <Link
                href="/auth?tab=signup"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
              >
                Become a Member
              </Link>
            </>
          )}

          {isLoggedIn && isOps && (
            <Link
              href="/ops"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
            >
              Dashboard
            </Link>
          )}

          {isLoggedIn && isMember && !isOps && (
            <Link
              href="/member/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
            >
              Member Portal
            </Link>
          )}

          {isLoggedIn && !isMember && !isOps && (
            <Link
              href="/application"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
            >
              Become a Member
            </Link>
          )}

          {/* User avatar dropdown */}
          {isLoggedIn && (
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue-light text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-brand-navy overflow-hidden"
                aria-label="User menu"
              >
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatarUrl} alt="Avatar" className="w-8 h-8 object-cover" />
                ) : (
                  initials
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-card-hover border border-gray-100 py-1.5 z-20">
                    {userEmail && (
                      <p className="px-4 py-2 text-xs text-brand-text-muted border-b border-gray-100 truncate">
                        {userEmail}
                      </p>
                    )}
                    {isMember && (
                      <>
                        <Link href="/member/profile" className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                        <Link href="/member/articles" className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface" onClick={() => setUserMenuOpen(false)}>My Articles</Link>
                      </>
                    )}
                    <Link href="/member/settings" className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); void signOut(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-navy-medium px-4 py-4">
          <div className="space-y-1 mb-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 px-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            {!isLoggedIn && (
              <>
                <Link href="/auth" className="block py-2.5 px-3 text-sm font-medium text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/auth?tab=signup" className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-dark transition-colors" onClick={() => setMobileOpen(false)}>Become a Member</Link>
              </>
            )}
            {isLoggedIn && isOps && <Link href="/ops" className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-blue text-white text-sm font-semibold" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
            {isLoggedIn && isMember && !isOps && <Link href="/member/dashboard" className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-blue text-white text-sm font-semibold" onClick={() => setMobileOpen(false)}>Member Portal</Link>}
            {isLoggedIn && !isMember && !isOps && <Link href="/application" className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-blue text-white text-sm font-semibold" onClick={() => setMobileOpen(false)}>Become a Member</Link>}
            {isLoggedIn && <button onClick={() => { setMobileOpen(false); void signOut(); }} className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10">Sign out</button>}
          </div>
        </div>
      )}
    </header>
  );
}
