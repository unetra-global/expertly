'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConsultationModal } from './ConsultationModal';
import type { MemberFullProfile } from '@/types/api';

interface MemberProfileProps {
  member: MemberFullProfile;
  isAuthenticated: boolean;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-brand-navy pb-3 border-b border-gray-100 mb-5">
      {children}
    </h2>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-blue-subtle border border-blue-100 px-3 py-1 text-xs font-medium text-brand-blue">
      {children}
    </span>
  );
}

function GrayTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-brand-text-secondary">
      {children}
    </span>
  );
}

export function MemberProfile({ member, isAuthenticated }: MemberProfileProps) {
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
  const isSeasoned = member.memberTier?.toLowerCase().includes('seasoned') ?? false;
  const hasFeeRange = isSeasoned && (member.feeRangeMin || member.feeRangeMax);

  return (
    <>
      {/* Hero band */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              {member.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.profilePhotoUrl}
                  alt={displayName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-bold text-3xl border-2 border-white/20">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + badges + location */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {member.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                {member.memberTier && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isSeasoned ? 'bg-amber-400/20 border-amber-400/30 text-amber-200' : 'bg-white/10 border-white/20 text-white/70'}`}>
                    {member.memberTier.toLowerCase().includes('seasoned') ? 'Seasoned Pro' : member.memberTier.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {displayName}
              </h1>

              {member.designation && (
                <p className="text-white/70 text-base mt-1">{member.designation}</p>
              )}
              {member.firmName && (
                <p className="text-white/50 text-sm mt-0.5">{member.firmName}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/60">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                  </span>
                )}
                {member.services?.name && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {member.services.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Headline + Bio */}
            {(member.headline || member.bio) && (
              <section>
                <SectionHeading>About</SectionHeading>
                {member.headline && (
                  <p className="text-base font-medium text-brand-navy mb-3 leading-snug">
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

            {/* Services */}
            {(member.services || (member.secondaryServices ?? []).length > 0) && (
              <section>
                <SectionHeading>Services</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {member.services && (
                    <Tag>{member.services.name}</Tag>
                  )}
                  {(member.secondaryServices ?? []).map((s) => (
                    <GrayTag key={s.id}>{s.name}</GrayTag>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {(member.workExperiences ?? []).length > 0 && (
              <section>
                <SectionHeading>Experience</SectionHeading>
                <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                  {(member.workExperiences ?? []).map((exp) => (
                    <div key={exp.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[1.3125rem] top-1 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-white" />
                      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-card">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-brand-navy text-sm">{exp.title}</h3>
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

            {/* Education */}
            {(member.educations ?? []).length > 0 && (
              <section>
                <SectionHeading>Education</SectionHeading>
                <div className="space-y-3">
                  {(member.educations ?? []).map((edu) => (
                    <div key={edu.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-card flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-navy text-sm">{edu.degree}</h3>
                        <p className="text-xs text-brand-text-secondary">{edu.institution}</p>
                        {edu.field && <p className="text-xs text-brand-text-muted">{edu.field}</p>}
                        {edu.endYear && <p className="text-xs text-brand-text-muted mt-0.5">{edu.endYear}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Qualifications */}
            {(member.qualifications ?? []).length > 0 && (
              <section>
                <SectionHeading>Qualifications</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {(member.qualifications ?? []).map((q) => (
                    <GrayTag key={q.id}>{q.name}{q.year ? ` (${q.year})` : ''}</GrayTag>
                  ))}
                </div>
              </section>
            )}

            {/* Credentials */}
            {(member.credentials ?? []).filter((c) => c.isVerified).length > 0 && (
              <section>
                <SectionHeading>Verified Credentials</SectionHeading>
                <div className="space-y-2">
                  {(member.credentials ?? []).filter((c) => c.isVerified).map((cred) => (
                    <div key={cred.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-card">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="h-4 w-4 text-brand-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-navy truncate">{cred.name}</p>
                        {cred.issuingBody && <p className="text-xs text-brand-text-muted truncate">{cred.issuingBody}</p>}
                      </div>
                      {cred.url && (
                        <a href={cred.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-brand-blue hover:underline flex-shrink-0">
                          View ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Testimonials */}
            {(member.testimonials ?? []).filter((t) => t.isVerified).length > 0 && (
              <section>
                <SectionHeading>Testimonials</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(member.testimonials ?? []).filter((t) => t.isVerified).map((t) => (
                    <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-card">
                      <svg className="h-6 w-6 text-brand-blue mb-3 opacity-40" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-sm text-brand-text-secondary leading-relaxed mb-3">{t.content}</p>
                      <div>
                        <p className="text-xs font-semibold text-brand-navy">{t.authorName}</p>
                        {t.authorTitle && <p className="text-xs text-brand-text-muted">{t.authorTitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Engagements */}
            {(member.engagements ?? []).length > 0 && (
              <section>
                <SectionHeading>Speaking &amp; Publications</SectionHeading>
                <div className="space-y-2">
                  {(member.engagements ?? []).map((eng) => (
                    <div key={eng.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-card">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue-subtle rounded-md px-2 py-0.5 flex-shrink-0">
                        {eng.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-navy">{eng.title}</p>
                        {eng.organization && <p className="text-xs text-brand-text-muted">{eng.organization}{eng.year ? ` · ${eng.year}` : ''}</p>}
                      </div>
                      {eng.url && (
                        <a href={eng.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-brand-blue hover:underline flex-shrink-0">↗</a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky sidebar ───────────────────────────── */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Consultation CTA card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                {isAuthenticated ? (
                  <>
                    <h3 className="text-base font-bold text-brand-navy mb-1">Contact this Expert</h3>
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
                    <h3 className="text-base font-bold text-brand-navy mb-2">Contact this Expert</h3>
                    <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">
                      Sign in to send a consultation request directly to {displayName}.
                    </p>
                    <Link href={`/auth?returnTo=/members/${member.slug}`} className="block w-full btn-primary text-center">
                      Sign in to Contact
                    </Link>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3">
                {member.yearsOfExperience && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center flex-shrink-0">
                      <svg className="h-4.5 w-4.5 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-brand-text-muted">Experience</p>
                      <p className="text-sm font-semibold text-brand-navy">{member.yearsOfExperience}+ years</p>
                    </div>
                  </div>
                )}

                {hasFeeRange && isAuthenticated && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-surface flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-brand-text-muted">Consultation Fee</p>
                      <p className="text-sm font-semibold text-brand-navy">
                        {member.feeCurrency ?? '$'}{member.feeRangeMin?.toLocaleString()}
                        {member.feeRangeMax ? `–${member.feeCurrency ?? '$'}${member.feeRangeMax.toLocaleString()}` : '+'}
                        /hr
                      </p>
                    </div>
                  </div>
                )}

                {member.firmWebsite && (
                  <div className="pt-2 border-t border-gray-50">
                    <a
                      href={member.firmWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Company website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Consultation modal */}
      {consultOpen && (
        <ConsultationModal
          member={member}
          onClose={() => setConsultOpen(false)}
        />
      )}
    </>
  );
}
