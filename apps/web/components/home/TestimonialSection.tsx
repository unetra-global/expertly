'use client';

import { useState } from 'react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  initials: string;
  avatarColor: string;
  photoUrl?: string;
}

const MEMBER_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Expertly gave me access to a calibre of clients I simply couldn't reach anywhere else. Every enquiry is from someone who genuinely values expert advice.",
    name: 'Priya Venkatesh',
    role: 'GST & Indirect Tax Director',
    location: 'Hyderabad, India',
    initials: 'PV',
    avatarColor: 'bg-amber-500',
  },
  {
    quote:
      "My inbound consultation requests tripled within 60 days of going live on Expertly. The right clients finally found me.",
    name: 'Marcus Chen',
    role: 'Senior Tax Advisor',
    location: 'Singapore',
    initials: 'MC',
    avatarColor: 'bg-rose-500',
  },
  {
    quote:
      "Publishing articles on Expertly built my professional brand faster than anything else I've tried. The audience is precisely who I want to reach.",
    name: 'Amara Osei',
    role: 'Corporate Counsel',
    location: 'Accra, Ghana',
    initials: 'AO',
    avatarColor: 'bg-violet-500',
  },
  {
    quote:
      "The network events alone justify the membership. I've made connections that would have taken years to build through traditional channels.",
    name: 'Fatima Al-Hassan',
    role: 'Compliance Director',
    location: 'Dubai, UAE',
    initials: 'FA',
    avatarColor: 'bg-cyan-600',
  },
];

const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We found our cross-border M&A advisor through Expertly in under a week. The verification process means you're dealing with real, credentialed professionals — not just anyone with a LinkedIn.",
    name: 'Thomas Müller',
    role: 'Founder, Mittelstand Capital',
    location: 'Frankfurt, Germany',
    initials: 'TM',
    avatarColor: 'bg-emerald-600',
  },
  {
    quote:
      "As a startup founder, navigating GST compliance felt overwhelming. Expertly connected me with an expert who explained everything clearly and saved us from costly mistakes.",
    name: 'Rohan Mehta',
    role: 'Co-Founder, Stacklane',
    location: 'Bangalore, India',
    initials: 'RM',
    avatarColor: 'bg-blue-500',
  },
  {
    quote:
      "I've used Expertly three times now for different legal matters. The quality has been consistently excellent — every expert I've worked with has been thorough and professional.",
    name: 'Sophie Laurent',
    role: 'Director, Lumière Group',
    location: 'Paris, France',
    initials: 'SL',
    avatarColor: 'bg-pink-500',
  },
  {
    quote:
      "We needed a compliance advisor for a UAE fintech licence application. Found the right person on Expertly within days. Couldn't have done it without this network.",
    name: 'James Okafor',
    role: 'CEO, PayRoute Africa',
    location: 'Lagos, Nigeria',
    initials: 'JO',
    avatarColor: 'bg-orange-500',
  },
];

function TestimonialCard({
  testimonial,
  isFeatured,
  isMember,
}: {
  testimonial: Testimonial;
  isFeatured?: boolean;
  isMember?: boolean;
}) {
  const avatarSize = isFeatured ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';

  const avatar = testimonial.photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={testimonial.photoUrl}
      alt={testimonial.name}
      className={`${avatarSize} rounded-full object-cover flex-shrink-0 border-2 border-white/20`}
    />
  ) : (
    <div
      className={`${avatarSize} ${testimonial.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {testimonial.initials}
    </div>
  );

  if (isFeatured) {
    return (
      <div className="relative rounded-2xl bg-white/[0.05] border border-white/[0.08] p-7 flex flex-col justify-between overflow-hidden h-full">
        <div
          className="absolute -bottom-10 -right-10 w-48 h-48 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative">
          <svg className="h-8 w-8 text-brand-gold/40 mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
          <p className="text-white text-lg sm:text-xl font-semibold leading-snug">
            {testimonial.quote}
          </p>
        </div>
        <div className="relative flex items-center gap-3 mt-7 pt-5 border-t border-white/[0.08]">
          {avatar}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">{testimonial.name}</p>
              {isMember && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold text-brand-gold uppercase tracking-wide">
                  ✓ Member
                </span>
              )}
            </div>
            <p className="text-white/45 text-xs mt-0.5">{testimonial.role} · {testimonial.location}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] p-5 flex flex-col gap-4 transition-colors duration-200">
      <svg className="h-5 w-5 text-brand-gold/35 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
      </svg>
      <p className="text-white/75 text-sm leading-relaxed flex-1">{testimonial.quote}</p>
      <div className="flex items-center gap-2.5 pt-4 border-t border-white/[0.08]">
        {avatar}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-white/80 text-xs font-semibold truncate">{testimonial.name}</p>
            {isMember && (
              <span className="inline-flex items-center rounded-full bg-brand-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-gold uppercase tracking-wide flex-shrink-0">
                Member
              </span>
            )}
          </div>
          <p className="text-white/35 text-[11px] truncate">{testimonial.role} · {testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const [tab, setTab] = useState<'members' | 'clients'>('members');

  const testimonials = tab === 'members' ? MEMBER_TESTIMONIALS : CLIENT_TESTIMONIALS;
  const [featured, ...grid] = testimonials;
  const isMember = tab === 'members';

  return (
    <section className="py-16 sm:py-20 bg-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">
              What people say
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by professionals worldwide
            </h2>
          </div>

          {/* Tab pills */}
          <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.08] rounded-xl p-1 sm:flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setTab('members')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'members'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              For Members
            </button>
            <button
              onClick={() => setTab('clients')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'clients'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              For Clients
            </button>
          </div>
        </div>

        {/* Layout: featured left + 2×2 grid right */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-[42%]">
            <TestimonialCard testimonial={featured} isFeatured isMember={isMember} />
          </div>
          <div className="lg:flex-1 min-w-0">
            {/* Mobile: horizontal snap-scroll */}
            <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2">
              {grid.slice(0, 4).map((t) => (
                <div key={t.name} className="snap-start flex-shrink-0 w-[80vw] max-w-[280px]">
                  <TestimonialCard testimonial={t} isMember={isMember} />
                </div>
              ))}
              <div className="flex-shrink-0 w-4" aria-hidden />
            </div>
            {/* Desktop: 2×2 grid */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 content-start">
              {grid.slice(0, 4).map((t) => (
                <TestimonialCard key={t.name} testimonial={t} isMember={isMember} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
