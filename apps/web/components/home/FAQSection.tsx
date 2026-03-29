'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Who can join Expertly?',
    a: 'Expertly is open to verified finance and legal professionals — including CFOs, tax advisors, chartered accountants, corporate lawyers, compliance officers, and more. Every member goes through a structured vetting process before being listed in the directory.',
  },
  {
    q: 'Is Expertly free to browse?',
    a: 'Yes. Anyone can browse the member directory, read expert articles, and view upcoming events without signing up. Full contact details, consultation requests, and member messaging require a free account.',
  },
  {
    q: 'How are members verified?',
    a: "All members apply through our structured onboarding process. We review professional credentials, years of experience, and area of specialisation before granting verified status. The verified badge is only awarded to profiles we've manually reviewed and approved.",
  },
  {
    q: 'Can I request a consultation with a member?',
    a: "Yes. Authenticated users can send consultation requests directly to any member. Members set their own availability and fee range — so you'll always know exactly what to expect upfront before committing.",
  },
  {
    q: 'What types of professionals are on Expertly?',
    a: 'Our network spans finance and legal disciplines — corporate law, taxation, mergers & acquisitions, regulatory compliance, accounting, wealth management, insolvency, FEMA, cross-border transactions, and more. Members come from over 30 countries.',
  },
  {
    q: 'How do I apply for membership?',
    a: "Click 'Apply for Membership' anywhere on the site and complete our application form. We review all applications within 5 business days and notify you by email with next steps.",
  },
  {
    q: 'Can I publish articles on Expertly?',
    a: 'Yes — verified members can publish articles through the member portal. Articles are reviewed before going live and are visible to the public, helping you build your professional brand and reach a targeted audience of peers and potential clients.',
  },
];

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.08]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
      >
        <span
          className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${
            open ? 'text-brand-gold' : 'text-white group-hover:text-white/80'
          }`}
        >
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
            open
              ? 'border-brand-gold rotate-45'
              : 'border-white/20 group-hover:border-white/40'
          }`}
        >
          <svg
            className={`h-3.5 w-3.5 transition-colors duration-200 ${open ? 'text-brand-gold' : 'text-white/50'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-48 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-white/60 text-sm sm:text-base leading-relaxed pr-12">{a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-brand-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="border-t border-white/[0.08]">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
