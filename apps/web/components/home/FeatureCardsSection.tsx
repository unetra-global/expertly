import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg className="h-7 w-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'FIND EXPERTS',
    description:
      'Search our global directory of vetted financial and legal professionals.',
    cta: 'EXPLORE',
    href: '/members',
  },
  {
    icon: (
      <svg className="h-7 w-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'READ INSIGHTS',
    description:
      'In-depth technical analysis and updates on global regulatory changes.',
    cta: 'READ',
    href: '/articles',
  },
  {
    icon: (
      <svg className="h-7 w-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'GLOBAL EVENTS',
    description:
      'Connect face-to-face at our regional and international conferences.',
    cta: 'VIEW',
    href: '/events',
  },
];

export default function FeatureCardsSection() {
  return (
    <section className="bg-gradient-to-b from-brand-navy to-gray-100 pt-0 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-2xl shadow-lg p-5 sm:p-6 flex flex-row sm:flex-col items-start gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon — left on mobile, top on desktop */}
              <div className="inline-flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-xl bg-blue-50">
                {feature.icon}
              </div>

              {/* Content + CTA */}
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="font-bold text-brand-navy text-sm tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {feature.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue group-hover:gap-2 transition-all uppercase tracking-wider mt-1">
                  {feature.cta}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
