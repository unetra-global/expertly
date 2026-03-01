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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-0.5">
          <span className="text-xl font-bold text-brand-navy">Expertly</span>
          <span className="text-xl font-bold text-brand-gold">.</span>
        </Link>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="w-full relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search experts, articles…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/members"
            className="text-sm font-medium text-gray-700 hover:text-brand-navy transition-colors"
          >
            Members
          </Link>
          <Link
            href="/articles"
            className="text-sm font-medium text-gray-700 hover:text-brand-navy transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium text-gray-700 hover:text-brand-navy transition-colors"
          >
            Events
          </Link>

          {/* Auth state */}
          {!isLoggedIn && (
            <Link
              href="/auth"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-white text-sm font-semibold transition-colors"
            >
              Sign in
            </Link>
          )}

          {isLoggedIn && isOps && (
            <Link
              href="/ops"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-navy hover:bg-brand-navy-dark text-white text-sm font-semibold transition-colors"
            >
              Dashboard
            </Link>
          )}

          {isLoggedIn && isMember && !isOps && (
            <Link
              href="/member/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-navy hover:bg-brand-navy-dark text-white text-sm font-semibold transition-colors"
            >
              Portal
            </Link>
          )}

          {isLoggedIn && !isMember && !isOps && (
            <Link
              href="/application"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-white text-sm font-semibold transition-colors"
            >
              Apply
            </Link>
          )}

          {/* User avatar dropdown */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-navy text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold"
                aria-label="User menu"
              >
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {userEmail && (
                      <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 truncate">
                        {userEmail}
                      </p>
                    )}
                    {isMember && (
                      <Link
                        href="/member/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    )}
                    {isMember && (
                      <Link
                        href="/member/articles"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Articles
                      </Link>
                    )}
                    <Link
                      href="/member/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        void signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-brand-navy hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {/* Mobile search */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search experts, articles…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-gray-400"
            />
          </div>

          {[
            { href: '/members', label: 'Members' },
            { href: '/articles', label: 'Articles' },
            { href: '/events', label: 'Events' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-navy hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100">
            {!isLoggedIn && (
              <Link
                href="/auth"
                className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-gold text-white text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
            {isLoggedIn && isOps && (
              <Link
                href="/ops"
                className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-navy text-white text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isLoggedIn && isMember && !isOps && (
              <Link
                href="/member/dashboard"
                className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-navy text-white text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Portal
              </Link>
            )}
            {isLoggedIn && !isMember && !isOps && (
              <Link
                href="/application"
                className="block w-full text-center py-2.5 px-3 rounded-lg bg-brand-gold text-white text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Apply
              </Link>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  void signOut();
                }}
                className="mt-2 block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
