import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Find Experts',
    description:
      'Search our global directory of vetted legal and finance professionals, filtered by service and country.',
    cta: 'Explore Directory',
    href: '/members',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Read Insights',
    description:
      'In-depth technical analysis and commentary on global regulatory changes, published by verified members.',
    cta: 'Read Articles',
    href: '/articles',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Global Events',
    description:
      'Connect face-to-face at our regional and international conferences, webinars, and networking sessions.',
    cta: 'View Events',
    href: '/events',
  },
];

export default function FeatureCardsSection() {
  return (
    <section className="bg-brand-navy-medium border-t border-white/8 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/15 text-brand-blue-light group-hover:bg-brand-blue/25 transition-colors">
                {feature.icon}
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-white text-base mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* CTA */}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-light group-hover:gap-2 transition-all mt-auto">
                {feature.cta}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
