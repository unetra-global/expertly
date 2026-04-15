'use client';

import { useState } from 'react';

const FAQ_SECTIONS = [
  {
    title: 'Joining & Membership',
    faqs: [
      {
        q: 'Who can join Expertly?',
        a: 'Expertly is open to all practising finance and legal professionals across the world. Whether you are an independent practitioner or part of a firm, if you are serious about your practice and looking for a trusted network of verified peers — to collaborate, share knowledge, and grow across borders — Expertly is the right place for you.',
      },
      {
        q: 'What types of professionals are on Expertly?',
        a: 'Our network spans professionals across all finance and legal domains — including tax and transfer pricing advisors, M&A and transaction advisors, investment bankers, private equity and venture capital advisors, insolvency and restructuring professionals, corporate and commercial lawyers, dispute resolution and arbitration counsel, banking and finance lawyers, capital markets and securities lawyers, intellectual property and technology lawyers, company secretaries, compliance and governance professionals, forensic accountants, valuation experts, and cost accountants.',
      },
      {
        q: 'What is the difference between a Budding Professional and a Seasoned Professional?',
        a: 'We have created two membership categories — Budding Professional and Seasoned Professional. A Budding Professional is someone with more than 5 years but fewer than 12 years of experience, whereas a Seasoned Professional is someone with more than 12 years of experience. Professionals with fewer than 5 years of experience are not currently eligible for membership, though we intend to introduce an associate category for early-career professionals in due course.',
      },
      {
        q: 'What does membership cost?',
        a: 'Annual membership is $499 for Budding Professionals and $699 for Seasoned Professionals. Occasionally, we offer promotional discount codes for new members — keep an eye on our website and social media channels for such offers.',
      },
      {
        q: 'How do I apply for membership?',
        a: "Click 'Apply for Membership' on our website and complete the application form. We review all applications and notify you by email within 5 business days.",
      },
      {
        q: 'How are members onboarded?',
        a: 'Every member goes through a robust selection process before being onboarded and listed in the directory. We review professional credentials, years of experience, and areas of specialisation, and take feedback from fellow professionals before granting membership. The process typically takes 5 to 7 business days from application to approval.',
      },
      {
        q: 'Can firms or organisations join Expertly, and what happens if a member changes firm?',
        a: 'Membership on Expertly is individual-based, not firm-based. Each professional joins on their own merits, credentials, and experience — independent of the firm or organisation they work for. This means your profile, reputation, articles, and network on Expertly belong entirely to you. If you move firms, set up your own practice, or change roles, your membership and everything you have built on the platform remains fully intact.',
      },
    ],
  },
  {
    title: 'Using the Platform',
    faqs: [
      {
        q: 'Is Expertly free to browse?',
        a: "Yes. Anyone can browse the member directory, view article headlines, and view event headlines without signing up. Full contact details of members, consultation requests, and full article and event details require registering a free account as a 'User'.",
      },
      {
        q: 'What is the difference between a User and a Member on Expertly?',
        a: 'A User is a person who has created a free account on Expertly but is not a member. A User can view the contact details of members, place consultation requests, read full articles, and view all event details. However, a User cannot post their profile or credentials, or write articles on the platform. A Member, on the other hand, can create a profile, be searchable on the platform, write articles, and more.',
      },
      {
        q: 'What is the difference between a Verified and an Unverified badge?',
        a: "The Verified badge is awarded only to profiles we have manually reviewed and approved. Verification covers professional credentials, qualifications, and years of experience as declared in the member's profile. If any section of a profile does not display the Verified badge, it means that the information in that section is either under review or has not yet been verified by the Expertly team.",
      },
      {
        q: 'Can I request a consultation with a member?',
        a: 'Yes. Registered users and members can send consultation requests directly to any member. Members set their own availability and fee range — so you will always know exactly what to expect upfront before committing.',
      },
      {
        q: 'Can I publish articles on Expertly?',
        a: 'Yes — members can publish articles through the member portal. Articles are reviewed before going live and becoming visible to the public, helping you build your professional brand and reach a targeted audience of peers and potential clients.',
      },
      {
        q: 'How does Expertly handle complaints or concerns about a member?',
        a: 'All members are required to maintain good standing with their respective professional bodies as a condition of membership. If you have a genuine concern about a member\'s conduct on the platform, you may submit a complaint through the platform and it will be reviewed by the Expertly compliance team. We take the integrity of our network seriously and will take appropriate action where warranted.',
      },
    ],
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
          open ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-white/60 text-sm sm:text-base leading-relaxed pr-12">{a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section className="py-24 bg-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-14">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              {/* Section heading */}
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold whitespace-nowrap">
                  {section.title}
                </h3>
                <div className="flex-1 h-px bg-brand-gold/20" />
              </div>

              <div className="border-t border-white/[0.08]">
                {section.faqs.map((faq, i) => {
                  const key = `${section.title}-${i}`;
                  return (
                    <FAQItem
                      key={key}
                      q={faq.q}
                      a={faq.a}
                      open={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
