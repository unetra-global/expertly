export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-navy mb-4">404</h1>
        <p className="text-xl text-brand-text-muted mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-blue-dark transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
