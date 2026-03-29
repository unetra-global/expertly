import Link from 'next/link';

const FEATURES = [
  {
    number: '01',
    title: 'Find Experts',
    description:
      'Search our global directory of vetted financial and legal professionals by specialty, location, and experience.',
    cta: 'Explore Directory',
    href: '/members',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Read Insights',
    description:
      'In-depth technical analysis, regulatory updates, and expert commentary from verified finance and legal professionals.',
    cta: 'Browse Articles',
    href: '/articles',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Global Events',
    description:
      'Connect at our regional and international conferences, webinars, and networking events for finance and legal professionals.',
    cta: 'View Events',
    href: '/events',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

type Feature = typeof FEATURES[number];

function FeatureCardInner({ feature }: { feature: Feature }) {
  return (
    <>
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.5), transparent)' }}
        aria-hidden
      />
      <span
        className="absolute right-4 bottom-1 text-[7rem] font-black leading-none pointer-events-none select-none tabular-nums text-white/[0.04]"
        aria-hidden
      >
        {feature.number}
      </span>
      <div className="relative inline-flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-xl bg-white/[0.06] border border-white/10 text-brand-blue-light group-hover:text-brand-gold group-hover:border-brand-gold/30 group-hover:bg-brand-gold/5 transition-all duration-300">
        {feature.icon}
      </div>
      <div className="relative flex flex-col gap-2 min-w-0">
        <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-white/50 leading-relaxed">
          {feature.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue-light group-hover:text-brand-gold group-hover:gap-2.5 transition-all uppercase tracking-wider mt-2">
          {feature.cta}
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </>
  );
}

export default function FeatureCardsSection() {
  return (
    <section className="relative bg-brand-navy pt-10 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile: horizontal snap-scroll */}
        <div className="sm:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="snap-start flex-shrink-0 w-[80vw] max-w-[300px] group relative border border-white/10 hover:border-brand-gold/40 rounded-2xl p-6 flex flex-col items-start gap-5 transition-all duration-300 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <FeatureCardInner feature={feature} />
            </Link>
          ))}
          <div className="flex-shrink-0 w-4" aria-hidden />
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative border border-white/10 hover:border-brand-gold/40 rounded-2xl p-7 flex flex-col items-start gap-5 transition-all duration-300 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <FeatureCardInner feature={feature} />
            </Link>
          ))}
        </div>
      </div>

      <div className="h-10" aria-hidden />
    </section>
  );
}
