'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ConsultationModal } from './ConsultationModal';
import { apiClient } from '@/lib/apiClient';
import type { MemberFullProfile, ArticleListItem } from '@/types/api';
import { MEMBER_TIER_LABELS, type MemberTier } from '@expertly/utils';

interface MemberProfileProps {
  member: MemberFullProfile;
  isAuthenticated: boolean;
}

type Tab = 'about' | 'credentials' | 'articles' | 'reviews' | 'contact';

const TABS: { id: Tab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'articles', label: 'Articles' },
  { id: 'reviews', label: 'Reviews & Recognition' },
  { id: 'contact', label: 'Contact Information' },
];

// ── Small reusable pieces ────────────────────────────────────────────────────

function GrayTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-medium text-brand-text-secondary">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-text-secondary uppercase tracking-wider mb-4">
      {children}
    </h3>
  );
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function AboutTab({ member }: { member: MemberFullProfile }) {
  const hasEngagements = (member.engagements ?? []).length > 0;

  return (
    <div className="space-y-8">
      {/* Headline + bio */}
      {(member.headline || member.bio) && (
        <section>
          {member.headline && (
            <p className="text-base font-semibold text-brand-navy mb-3 leading-snug">
              {member.headline}
            </p>
          )}
          {member.bio && (
            <p className="text-sm text-brand-text-secondary leading-relaxed whitespace-pre-line">
              {member.bio}
            </p>
          )}
        </section>
      )}

      {/* Key Engagements */}
      {hasEngagements && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Engagements
          </SectionLabel>
          <div className="space-y-2">
            {(member.engagements ?? []).map((eng) => (
              <div key={eng.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-brand-blue-subtle flex items-center justify-center flex-shrink-0">
                  <svg className="h-3 w-3 text-brand-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brand-navy">{eng.title}</p>
                  {(eng.organization || eng.year) && (
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {eng.organization}{eng.organization && eng.year ? ' · ' : ''}{eng.year}
                    </p>
                  )}
                </div>
                {eng.url && (
                  <a href={eng.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue hover:underline flex-shrink-0">↗</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Qualifications */}
      {(member.qualifications ?? []).length > 0 && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Qualifications
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {(member.qualifications ?? []).map((q) => (
              <GrayTag key={q.id}>{q.name}{q.year ? ` (${q.year})` : ''}</GrayTag>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {(member.educations ?? []).length > 0 && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {(member.educations ?? []).map((edu) => (
              <div key={edu.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-sm text-brand-navy">{edu.degree}</p>
                <p className="text-xs text-brand-text-secondary mt-0.5">{edu.institution}{edu.endYear ? ` · ${edu.endYear}` : ''}</p>
                {edu.field && <p className="text-xs text-brand-text-muted mt-0.5">{edu.field}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {!member.headline && !member.bio && !hasEngagements && (
        <p className="text-sm text-brand-text-muted py-6 text-center">No information available yet.</p>
      )}
    </div>
  );
}


function CredentialsTab({ member }: { member: MemberFullProfile }) {
  const hasQuals = (member.qualifications ?? []).length > 0;
  const hasEdu = (member.educations ?? []).length > 0;
  const hasExp = (member.workExperiences ?? []).length > 0;
  const hasCreds = (member.credentials ?? []).length > 0;

  return (
    <div className="space-y-8">
      {hasEdu && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {(member.educations ?? []).map((edu) => (
              <div key={edu.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-sm text-brand-navy">{edu.degree}</p>
                <p className="text-xs text-brand-text-secondary mt-0.5">{edu.institution}{edu.endYear ? ` · ${edu.endYear}` : ''}</p>
                {edu.field && <p className="text-xs text-brand-text-muted mt-0.5">{edu.field}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasQuals && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Qualifications
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {(member.qualifications ?? []).map((q) => (
              <GrayTag key={q.id}>{q.name}{q.year ? ` (${q.year})` : ''}</GrayTag>
            ))}
          </div>
        </section>
      )}

      {hasExp && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Work Experience
          </SectionLabel>
          <div className="relative pl-4 border-l-2 border-gray-100 space-y-5">
            {(member.workExperiences ?? []).map((exp) => (
              <div key={exp.id} className="relative">
                <div className="absolute -left-[1.3125rem] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-white" />
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-brand-navy">{exp.title}</p>
                      <p className="text-xs text-brand-text-secondary mt-0.5">{exp.company}</p>
                    </div>
                    <span className="text-xs text-brand-text-muted whitespace-nowrap">
                      {exp.startYear}–{exp.isCurrent ? 'Present' : (exp.endYear ?? '')}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-xs text-brand-text-muted leading-relaxed">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasCreds && (
        <section>
          <SectionLabel>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Credentials
          </SectionLabel>
          <div className="space-y-2">
            {(member.credentials ?? []).map((cred) => (
              <div key={cred.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cred.isVerified ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <svg className={`h-4 w-4 ${cred.isVerified ? 'text-brand-blue' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-navy">{cred.name}</p>
                  {(cred.issuingBody || cred.year) && (
                    <p className="text-xs text-brand-text-muted">{cred.issuingBody}{cred.issuingBody && cred.year ? ` · ${cred.year}` : cred.year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasQuals && !hasEdu && !hasExp && !hasCreds && (
        <p className="text-sm text-brand-text-muted py-6 text-center">No credentials added yet.</p>
      )}
    </div>
  );
}

function ContactTab({ member }: { member: MemberFullProfile }) {
  const contactEmail = member.contactEmail || member.users?.email;
  const contactPhone = member.contactPhone;
  const hasContact = !!(contactPhone || contactEmail || member.linkedinUrl || member.website || member.firmWebsite);

  if (!hasContact) {
    return <p className="text-sm text-brand-text-muted py-6 text-center">No contact information available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:border-brand-blue/30 hover:bg-brand-blue-subtle transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue-subtle flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue/10">
              <svg className="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-brand-navy truncate">{contactEmail}</p>
            </div>
          </a>
        )}
        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:border-brand-blue/30 hover:bg-brand-blue-subtle transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue-subtle flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue/10">
              <svg className="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wide">Phone</p>
              <p className="text-sm font-semibold text-brand-navy truncate">{contactPhone}</p>
            </div>
          </a>
        )}
        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:border-brand-blue/30 hover:bg-brand-blue-subtle transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue-subtle flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-brand-blue" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wide">LinkedIn</p>
              <p className="text-sm font-semibold text-brand-navy truncate">View Profile</p>
            </div>
          </a>
        )}
        {(member.website || member.firmWebsite) && (
          <a
            href={(member.website || member.firmWebsite)!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:border-brand-blue/30 hover:bg-brand-blue-subtle transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue-subtle flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wide">Website</p>
              <p className="text-sm font-semibold text-brand-navy truncate">{(member.website || member.firmWebsite)!.replace(/^https?:\/\//, '')}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

function ArticlesTab({ member, displayName }: { member: MemberFullProfile; displayName: string }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['member-articles', member.id],
    queryFn: () =>
      apiClient.get<{ data: ArticleListItem[]; meta: { total: number } }>('/articles', {
        memberId: member.id,
        limit: 10,
      }),
    enabled: !!member.id,
  });

  const articles = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="h-10 w-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-brand-text-muted">No published articles yet.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-brand-text-secondary mb-4">Articles by {displayName}</p>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-brand-blue/30 hover:shadow-md transition-all group"
          >
            {article.featuredImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.featuredImageUrl}
                alt=""
                className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              {article.category && (
                <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">
                  {article.category.name}
                </span>
              )}
              <p className="text-sm font-semibold text-brand-navy mt-0.5 group-hover:text-brand-blue transition-colors line-clamp-2">
                {article.title}
              </p>
              <p className="text-xs text-brand-text-muted mt-1">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''}
                {article.readTimeMinutes ? ` · ${article.readTimeMinutes} min read` : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
        <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-brand-navy mb-1">Coming Soon</p>
      <p className="text-xs text-brand-text-muted">Reviews &amp; Recognition will be available here shortly.</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MemberProfile({ member, isAuthenticated }: MemberProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [consultOpen, setConsultOpen] = useState(false);

  const displayName =
    member.users?.fullName ||
    [member.users?.firstName, member.users?.lastName].filter(Boolean).join(' ') ||
    'Expert';

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const location = [member.city, member.country].filter(Boolean).join(', ');
  const isSeasoned = member.memberTier === 'seasoned_professional';
  const hasFeeRange = isSeasoned && isAuthenticated && (member.feeRangeMin || member.feeRangeMax);
  const tierLabel = member.memberTier
    ? MEMBER_TIER_LABELS[member.memberTier as MemberTier] ?? member.memberTier
    : null;

  return (
    <>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Profile header card ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden mb-6">
            {/* Navy top band */}
            <div className="h-24 sm:h-28 bg-brand-navy relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 30% 120%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 50%, rgba(37,99,235,0.07) 0%, transparent 60%)' }}
                aria-hidden
              />
            </div>

            <div className="px-4 sm:px-6 pb-6">
              {/* Avatar — overlaps top band */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5 -mt-14 sm:-mt-16">
                <div className="relative flex-shrink-0">
                  {member.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profilePhotoUrl}
                      alt={displayName}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover object-top border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-brand-navy flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
                      {initials}
                    </div>
                  )}
                  {member.isVerified && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center border-2 border-white shadow-sm" title="Expertly Verified">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* LinkedIn button — aligned to bottom of avatar on desktop */}
                <div className="flex-1 sm:pb-1 flex justify-end">
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold px-4 py-2.5 transition-colors flex-shrink-0"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Details — below avatar */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">{displayName}</h1>
                  {member.isVerified && (
                    <svg className="h-6 w-6 text-brand-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tierLabel && (
                    <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${isSeasoned ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      {tierLabel}
                    </span>
                  )}
                </div>
                {member.designation && (
                  <p className="text-base font-medium text-brand-text-secondary">{member.designation}</p>
                )}
                {member.firmName && (
                  <p className="text-sm text-brand-text-muted mt-0.5">{member.firmName}</p>
                )}

                {/* Stats row */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-brand-text-muted">
                  {location && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {location}
                    </span>
                  )}
                  {member.yearsOfExperience && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {member.yearsOfExperience}+ years experience
                    </span>
                  )}
                  {hasFeeRange && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {member.feeCurrency ?? '$'}{member.feeRangeMin?.toLocaleString()}–{member.feeCurrency ?? '$'}{member.feeRangeMax?.toLocaleString()} / hr
                    </span>
                  )}
                  {member.services?.name && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {member.services.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile CTA — visible below lg where sidebar is hidden above fold ── */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                {hasFeeRange && (
                  <p className="text-sm font-bold text-brand-navy">
                    {member.feeCurrency ?? '$'}{member.feeRangeMin?.toLocaleString()}
                    {member.feeRangeMax ? `–${member.feeCurrency ?? '$'}${member.feeRangeMax.toLocaleString()}` : '+'}
                    <span className="text-xs font-normal text-brand-text-muted"> / hr</span>
                  </p>
                )}
                {member.isAvailable !== false ? (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Available
                  </p>
                ) : (
                  <p className="text-xs text-brand-text-muted mt-0.5">Currently unavailable</p>
                )}
              </div>
              {isAuthenticated ? (
                <button
                  onClick={() => setConsultOpen(true)}
                  disabled={member.isAvailable === false}
                  className="btn-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2"
                >
                  Request Consultation
                </button>
              ) : (
                <Link
                  href={`/auth?returnTo=/members/${member.slug}`}
                  className="btn-primary flex-shrink-0 text-sm px-4 py-2 text-center"
                >
                  Sign in to Contact
                </Link>
              )}
            </div>
          </div>

          {/* ── Two-column layout ────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

            {/* ── Left: tabs + content ──────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Tab nav */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-none">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-brand-navy border-b-2 border-brand-blue -mb-px bg-white'
                          : 'text-brand-text-muted hover:text-brand-text-secondary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                {activeTab === 'about' && <AboutTab member={member} />}
                {activeTab === 'credentials' && <CredentialsTab member={member} />}
                {activeTab === 'articles' && <ArticlesTab member={member} displayName={displayName} />}
                {activeTab === 'contact' && <ContactTab member={member} />}
                {activeTab === 'reviews' && <ReviewsTab />}
              </div>
            </div>

            {/* ── Right: sidebar — hidden on mobile (CTA shown above instead) ── */}
            <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0 space-y-4">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Consultation fee + CTA */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  {hasFeeRange && (
                    <>
                      <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-1">Consultation Fee</p>
                      <p className="text-2xl font-bold text-brand-navy mb-4">
                        {member.feeCurrency ?? '$'}{member.feeRangeMin?.toLocaleString()}
                        <span className="text-base font-semibold"> – {member.feeCurrency ?? '$'}{member.feeRangeMax?.toLocaleString()}</span>
                        <span className="text-sm text-brand-text-muted font-normal"> / hr</span>
                      </p>
                    </>
                  )}

                  {isAuthenticated ? (
                    <>
                      {member.isAvailable !== false ? (
                        <p className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          Available for consultations
                        </p>
                      ) : (
                        <p className="text-xs text-brand-text-muted mb-3">Currently unavailable</p>
                      )}
                      {member.availabilityNotes && (
                        <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">{member.availabilityNotes}</p>
                      )}
                      <button
                        onClick={() => setConsultOpen(true)}
                        disabled={member.isAvailable === false}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Request Consultation
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">
                        Sign in to send a consultation request to {displayName}.
                      </p>
                      <Link href={`/auth?returnTo=/members/${member.slug}`} className="block w-full btn-primary text-center">
                        Sign in to Contact
                      </Link>
                    </>
                  )}

                  {member.firmWebsite && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <a href={member.firmWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Company website
                      </a>
                    </div>
                  )}
                </div>

                {/* Location */}
                {location && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-3">Location</p>
                    <div className="flex items-start gap-2.5">
                      <svg className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-brand-navy font-medium">{location}</p>
                    </div>
                  </div>
                )}

                {/* Expertly Verified badge */}
                {member.isVerified && (
                  <div className="bg-brand-navy rounded-2xl p-5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <svg className="h-5 w-5 text-brand-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs font-bold text-white uppercase tracking-wide">Expertly Verified</p>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {displayName}&apos;s credentials, employment history, and identity have been verified by the Expertly team.
                    </p>
                  </div>
                )}

                {/* Back to members */}
                <Link href="/members" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-navy transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Members
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {consultOpen && (
        <ConsultationModal member={member} onClose={() => setConsultOpen(false)} />
      )}
    </>
  );
}
