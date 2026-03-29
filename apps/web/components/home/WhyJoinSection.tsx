import Link from 'next/link';

const CLIENT_BENEFITS = [
  'Browse thousands of vetted finance & legal professionals',
  'Read expert articles on tax, law, M&A, compliance & more',
  'Request consultations directly — no middlemen, no guesswork',
  'See transparent rates upfront before you commit',
];

const MEMBER_BENEFITS = [
  'Get discovered by businesses and clients globally',
  'Publish articles and establish your professional authority',
  'Access exclusive events and network with verified peers',
  'Set your own rates, availability, and consultation terms',
];

export default function WhyJoinSection() {
  return (
    <section className="py-16 sm:py-20 bg-brand-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">
            Why Expertly
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
            One platform, two ways in.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── For Clients & Businesses ─────────────────── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10 flex flex-col">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
                For Clients &amp; Businesses
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight leading-tight mb-3">
              Find the right expert,<br />fast.
            </h2>
            <p className="text-brand-text-secondary text-base leading-relaxed mb-8">
              Access a curated directory of verified finance and legal professionals.
              No cold outreach, no uncertainty.
            </p>

            <ul className="space-y-3.5 mb-10 flex-1">
              {CLIENT_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <svg className="h-3 w-3 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm text-brand-text-secondary leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/members"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy/90 text-white font-bold text-sm transition-colors self-start"
            >
              Browse Members
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* ── For Finance & Legal Professionals ────────── */}
          <div className="bg-brand-navy rounded-3xl p-8 sm:p-10 flex flex-col relative overflow-hidden">
            {/* Warm gold accent glow */}
            <div
              className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 100% 100%, rgba(245,158,11,0.14) 0%, transparent 65%)',
              }}
              aria-hidden
            />
            {/* Subtle blue top-left */}
            <div
              className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.06) 0%, transparent 65%)',
              }}
              aria-hidden
            />

            <div className="relative flex flex-col flex-1">
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-xl bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                  For Finance &amp; Legal Professionals
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3">
                Build your professional<br />presence.
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-8">
                Join a curated network of verified experts. Get discovered by the
                right clients, publish your insights, and grow your reputation.
              </p>

              <ul className="space-y-3.5 mb-10 flex-1">
                {MEMBER_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-gold/20 flex items-center justify-center">
                      <svg className="h-3 w-3 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-white/70 leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/application"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold hover:bg-amber-500 text-white font-bold text-sm transition-colors self-start"
              >
                Apply for Membership
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
