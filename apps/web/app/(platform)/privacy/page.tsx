export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Expertly',
  description: 'Learn how Expertly collects, uses, and protects your personal data.',
};

const LAST_UPDATED = '1 March 2026';
const EFFECTIVE_DATE = '1 March 2026';

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="section-label mb-2">Legal</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">
            Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Table of contents */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">Contents</p>
              <nav className="space-y-2">
                {[
                  ['#overview', 'Overview'],
                  ['#controller', 'Data Controller'],
                  ['#collect', 'Data We Collect'],
                  ['#use', 'How We Use Data'],
                  ['#legal-basis', 'Legal Basis'],
                  ['#sharing', 'Data Sharing'],
                  ['#transfers', 'International Transfers'],
                  ['#retention', 'Retention'],
                  ['#rights', 'Your Rights'],
                  ['#cookies', 'Cookies'],
                  ['#security', 'Security'],
                  ['#children', 'Children'],
                  ['#changes', 'Policy Changes'],
                  ['#contact', 'Contact Us'],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="block text-sm text-brand-text-secondary hover:text-brand-navy transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0 prose prose-sm max-w-none prose-headings:text-brand-navy prose-headings:font-bold prose-p:text-brand-text-secondary prose-li:text-brand-text-secondary prose-a:text-brand-blue">

            <p className="text-brand-text-secondary leading-relaxed">
              At <strong>Expertly</strong>, we take your privacy seriously. This Privacy Policy explains how Expertly Global Ltd (&ldquo;Expertly&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, and shares your personal data when you use our Platform, and describes your rights under applicable data protection laws, including the UK GDPR and EU GDPR.
            </p>

            <Section id="overview" title="1. Overview">
              <p>
                Expertly is a curated professional network for verified finance and legal professionals. We collect personal data to operate and improve our Platform, verify member credentials, facilitate professional connections, and comply with our legal obligations. We are committed to handling your data transparently, lawfully, and securely.
              </p>
            </Section>

            <Section id="controller" title="2. Data Controller">
              <p>
                Expertly Global Ltd is the data controller responsible for your personal data. Our registered contact for data protection matters is:
              </p>
              <address className="not-italic mt-3 text-brand-text-secondary text-sm leading-relaxed">
                <strong className="text-brand-navy">Data Protection Contact</strong><br />
                Email: <a href="mailto:privacy@expertly.global">privacy@expertly.global</a>
              </address>
            </Section>

            <Section id="collect" title="3. Data We Collect">
              <p>We collect the following categories of personal data:</p>

              <h3 className="text-base font-semibold text-brand-navy mt-4 mb-2">3.1 Information you provide directly</h3>
              <ul>
                <li><strong>Identity data:</strong> full name, profile photo, professional title, firm name.</li>
                <li><strong>Contact data:</strong> email address, phone number, LinkedIn profile URL, website.</li>
                <li><strong>Professional data:</strong> years of experience, qualifications, credentials, work history, education, services offered, areas of expertise, membership tier.</li>
                <li><strong>Application data:</strong> information submitted as part of your membership application, including identity documents provided for verification.</li>
                <li><strong>Content data:</strong> articles, profile bio, key engagements, testimonials, and other content you publish on the Platform.</li>
                <li><strong>Communications:</strong> messages you send to us or through the Platform, support requests, and consultation requests.</li>
              </ul>

              <h3 className="text-base font-semibold text-brand-navy mt-4 mb-2">3.2 Information collected automatically</h3>
              <ul>
                <li><strong>Usage data:</strong> pages visited, features used, search queries, clicks, and session duration.</li>
                <li><strong>Device data:</strong> IP address, browser type and version, operating system, device identifiers.</li>
                <li><strong>Log data:</strong> server logs, error reports, and performance data.</li>
                <li><strong>Cookies and similar technologies:</strong> see Section 11 (Cookies) for full details.</li>
              </ul>

              <h3 className="text-base font-semibold text-brand-navy mt-4 mb-2">3.3 Information from third parties</h3>
              <ul>
                <li><strong>LinkedIn:</strong> if you connect your LinkedIn account, we may receive publicly available professional profile data.</li>
                <li><strong>Identity verification providers:</strong> verification status and flags from our authorised verification partners.</li>
                <li><strong>Referrals:</strong> limited information from members who refer you to the Platform.</li>
              </ul>
            </Section>

            <Section id="use" title="4. How We Use Your Data">
              <p>We use your personal data for the following purposes:</p>
              <ul>
                <li><strong>Platform operation:</strong> to create and manage your account, process your membership application, display your public profile, and deliver our services.</li>
                <li><strong>Verification:</strong> to verify your professional identity, qualifications, and credentials.</li>
                <li><strong>Communications:</strong> to send service notifications, membership updates, event invitations, the weekly digest, and responses to your enquiries.</li>
                <li><strong>Personalisation:</strong> to surface relevant members, articles, and events based on your expertise and activity.</li>
                <li><strong>Platform improvement:</strong> to analyse usage patterns, fix bugs, and develop new features.</li>
                <li><strong>Safety and compliance:</strong> to detect fraud, enforce our Terms of Service, and comply with legal obligations.</li>
                <li><strong>Marketing:</strong> to send you information about Expertly features or services where you have given consent or where we have a legitimate interest (you may opt out at any time).</li>
              </ul>
            </Section>

            <Section id="legal-basis" title="5. Legal Basis for Processing">
              <p>We process your personal data on the following legal bases under UK/EU GDPR:</p>
              <ul>
                <li><strong>Contract performance:</strong> processing necessary to fulfil our agreement with you, including operating your account and membership.</li>
                <li><strong>Legitimate interests:</strong> improving our Platform, preventing fraud, and ensuring network security — balanced against your privacy rights.</li>
                <li><strong>Consent:</strong> where you have given clear consent (e.g., marketing emails, LinkedIn data import). You may withdraw consent at any time without affecting the lawfulness of prior processing.</li>
                <li><strong>Legal obligation:</strong> where processing is required by applicable law or regulation.</li>
              </ul>
            </Section>

            <Section id="sharing" title="6. Data Sharing">
              <p>We do not sell your personal data. We share it only in the following circumstances:</p>
              <ul>
                <li><strong>Other users:</strong> your public profile information (name, designation, expertise, location, and published content) is visible to authenticated Platform members.</li>
                <li><strong>Service providers:</strong> we share data with trusted third-party processors who help us operate the Platform (e.g., cloud hosting, email delivery, identity verification). These providers are contractually bound to process data only on our instructions.</li>
                <li><strong>Professional verification:</strong> limited data is shared with accreditation and verification bodies as part of the credentialing process.</li>
                <li><strong>Legal requirements:</strong> we may disclose data to law enforcement, regulators, or courts where required by law or to protect the rights, property, or safety of Expertly, our members, or the public.</li>
                <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of all or part of our business, your data may be transferred to the successor entity, subject to the same privacy protections.</li>
              </ul>
            </Section>

            <Section id="transfers" title="7. International Data Transfers">
              <p>
                Your data may be processed in countries outside the UK and European Economic Area (EEA) where our service providers operate. Where we transfer data internationally, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the relevant supervisory authority, or we rely on adequacy decisions. You may request details of these safeguards by contacting us.
              </p>
            </Section>

            <Section id="retention" title="8. Data Retention">
              <p>
                We retain your personal data for as long as necessary to fulfil the purposes described in this Policy, unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul>
                <li><strong>Account data:</strong> retained for the duration of your membership and for up to 7 years after account closure for legal and audit purposes.</li>
                <li><strong>Application data:</strong> retained for up to 7 years from the date of your application, regardless of outcome.</li>
                <li><strong>Content data (articles, profile):</strong> retained until you delete the content or close your account, subject to legal holds.</li>
                <li><strong>Usage and log data:</strong> typically retained for 12 months.</li>
              </ul>
              <p>
                When data is no longer required, we securely delete or anonymise it.
              </p>
            </Section>

            <Section id="rights" title="9. Your Rights">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
                <li><strong>Rectification:</strong> request correction of inaccurate or incomplete data.</li>
                <li><strong>Erasure:</strong> request deletion of your data (the &ldquo;right to be forgotten&rdquo;), subject to legal retention obligations.</li>
                <li><strong>Restriction:</strong> request that we limit processing of your data in certain circumstances.</li>
                <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> object to processing based on legitimate interests or for direct marketing purposes.</li>
                <li><strong>Withdraw consent:</strong> where processing is based on consent, withdraw it at any time.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at <a href="mailto:privacy@expertly.global">privacy@expertly.global</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local supervisory authority (e.g., the UK Information Commissioner&apos;s Office at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>).
              </p>
            </Section>

            <Section id="cookies" title="10. Cookies and Tracking Technologies">
              <p>
                We use cookies and similar technologies to operate and improve the Platform. Cookies are small text files stored on your device. We use:
              </p>
              <ul>
                <li><strong>Essential cookies:</strong> required for the Platform to function (e.g., session authentication). These cannot be disabled.</li>
                <li><strong>Analytics cookies:</strong> help us understand how users interact with the Platform (e.g., page views, session duration). We use anonymised analytics where possible.</li>
                <li><strong>Preference cookies:</strong> remember your settings and preferences.</li>
              </ul>
              <p>
                You can control non-essential cookies via your browser settings. Disabling certain cookies may affect the functionality of the Platform.
              </p>
            </Section>

            <Section id="security" title="11. Security">
              <p>
                We implement industry-standard technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration, or destruction. These include:
              </p>
              <ul>
                <li>Encryption of data in transit (TLS) and at rest (AES-256).</li>
                <li>Role-based access controls limiting staff access to personal data.</li>
                <li>Regular security assessments and penetration testing.</li>
                <li>Secure credential management with no plaintext password storage.</li>
              </ul>
              <p>
                While we take reasonable steps to protect your data, no internet transmission is 100% secure. We cannot guarantee absolute security and encourage you to use a strong, unique password and to notify us immediately if you suspect any unauthorised access.
              </p>
            </Section>

            <Section id="children" title="12. Children's Privacy">
              <p>
                The Platform is not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected data from a person under 18 without parental consent, we will delete that data promptly. If you believe we have collected such data, please contact us at <a href="mailto:privacy@expertly.global">privacy@expertly.global</a>.
              </p>
            </Section>

            <Section id="changes" title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page and notify you of material changes via email or a prominent notice on the Platform. We encourage you to review this Policy periodically. Your continued use of the Platform after changes are posted constitutes acceptance of the updated Policy.
              </p>
            </Section>

            <Section id="contact" title="14. Contact Us">
              <p>
                For any questions, concerns, or requests relating to this Privacy Policy or our data practices, please contact:
              </p>
              <address className="not-italic mt-3 text-brand-text-secondary text-sm leading-relaxed">
                <strong className="text-brand-navy">Expertly Global Ltd — Data Protection</strong><br />
                Email: <a href="mailto:privacy@expertly.global">privacy@expertly.global</a><br />
                Website: <Link href="/">expertly.global</Link>
              </address>
            </Section>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Read our Terms of Service
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-navy transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-28">
      <h2 className="text-lg font-bold text-brand-navy mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
