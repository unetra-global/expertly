'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSignOut } from '@/hooks/useAuth';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';

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
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const signOut = useSignOut();

  const isLoggedIn = userRole !== null;
  const isMember = userRole === 'member';
  const isOps = userRole === 'ops' || userRole === 'backend_admin';
  const isPlainUser = userRole === 'user';

  const initials = userEmail ? userEmail[0].toUpperCase() : 'U';

  const navLinks = [
    { href: '/members', label: 'Find Members' },
    { href: '/articles', label: 'Articles' },
    { href: '/events', label: 'Events' },
  ];

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close drawer on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    if (mobileOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const ctaLink = isLoggedIn
    ? isOps ? '/ops'
    : isMember ? '/member/dashboard'
    : '/application'
    : '/auth';

  const ctaLabel = isLoggedIn
    ? isOps ? 'Dashboard'
    : isMember ? 'Member Portal'
    : 'Become a Member'
    : 'Log In';

  return (
    <>
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
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname?.startsWith(href) ?? false;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors whitespace-nowrap pb-0.5 ${
                    isActive
                      ? 'text-white border-b-2 border-brand-blue'
                      : 'text-white/70 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop search bar ────────────────────────── */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <GlobalSearchBar />
          </div>

          {/* ── Desktop right side ────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn && (
              <Link
                href="/auth"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
              >
                Log In
              </Link>
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
                          <Link href="/member/articles/new" className="block px-4 py-2 text-sm font-medium text-brand-blue hover:bg-brand-blue-subtle" onClick={() => setUserMenuOpen(false)}>✏ Write Article</Link>
                        </>
                      )}
                      {(isMember || isOps || isPlainUser) && (
                        <Link href="/member/settings" className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-surface" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                      )}
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

          {/* ── Mobile right group: Search + Log In + hamburger ──── */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {!isLoggedIn && (
              <Link
                href="/auth"
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-colors"
              >
                Log In
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile search overlay ─────────────────────────── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-brand-navy/95 flex flex-col md:hidden">
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
            <GlobalSearchBar
              className="flex-1"
              autoFocus
              onClose={() => setMobileSearchOpen(false)}
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile drawer backdrop ─────────────────────────── */}
      <div
        className={`fixed inset-0 z-[55] bg-black/50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* ── Mobile drawer (slides from right) ─────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-72 z-[60] bg-brand-navy flex flex-col md:hidden shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-7 h-7 rounded bg-brand-blue flex items-center justify-center group-hover:bg-brand-blue-dark transition-colors">
              <span className="text-white font-bold text-xs leading-none select-none">E</span>
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Expertly</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1 mb-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname?.startsWith(href) ?? false;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center py-3 px-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/10 border-l-2 border-brand-blue pl-[10px]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="border-t border-white/10 pt-5 space-y-2">
            <Link
              href={ctaLink}
              className="flex w-full items-center justify-center py-3 px-4 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-dark transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {ctaLabel}
            </Link>

            {isLoggedIn && (
              <div className="pt-3 border-t border-white/10 mt-3">
                {userEmail && (
                  <p className="text-xs text-white/40 px-3 pb-3 truncate">{userEmail}</p>
                )}
                {isMember && (
                  <Link
                    href="/member/articles/new"
                    className="flex items-center py-3 px-3 rounded-xl text-sm font-medium text-brand-blue bg-brand-blue-subtle/20 hover:bg-brand-blue-subtle/40 transition-colors mb-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    ✏ Write Article
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); void signOut(); }}
                  className="w-full text-left py-3 px-3 rounded-xl text-sm font-medium text-red-400 hover:bg-white/10 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
