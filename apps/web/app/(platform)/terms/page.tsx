import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Expertly',
  description: 'Read the Terms of Service governing your use of the Expertly platform.',
};

const LAST_UPDATED = '1 March 2026';
const EFFECTIVE_DATE = '1 March 2026';

export default function TermsPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="section-label mb-2">Legal</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">
            Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Effective: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Table of contents — sticky sidebar */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-4">Contents</p>
              <nav className="space-y-2">
                {[
                  ['#acceptance', 'Acceptance'],
                  ['#eligibility', 'Eligibility'],
                  ['#accounts', 'Accounts'],
                  ['#membership', 'Membership'],
                  ['#content', 'User Content'],
                  ['#ip', 'Intellectual Property'],
                  ['#prohibited', 'Prohibited Conduct'],
                  ['#disclaimers', 'Disclaimers'],
                  ['#liability', 'Limitation of Liability'],
                  ['#indemnification', 'Indemnification'],
                  ['#termination', 'Termination'],
                  ['#governing', 'Governing Law'],
                  ['#changes', 'Changes'],
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
              Welcome to <strong>Expertly</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our platform, website, and services (collectively, the &ldquo;Platform&rdquo;). By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
            </p>

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                By creating an account, applying for membership, or otherwise accessing or using any part of the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, together with our <Link href="/privacy">Privacy Policy</Link>, which is incorporated herein by reference. These Terms constitute a legally binding agreement between you and Expertly Global Ltd.
              </p>
            </Section>

            <Section id="eligibility" title="2. Eligibility">
              <p>You must be at least 18 years of age and legally capable of entering into binding contracts to use the Platform. By using the Platform, you represent and warrant that:</p>
              <ul>
                <li>You are at least 18 years old.</li>
                <li>You have the legal capacity to agree to these Terms.</li>
                <li>You are not prohibited from using the Platform under any applicable law.</li>
                <li>You will only provide accurate and truthful information.</li>
              </ul>
              <p>
                Membership on the Platform is restricted to verified finance and legal professionals. Eligibility for verified membership status is determined at our sole discretion based on qualifications, experience, and identity verification.
              </p>
            </Section>

            <Section id="accounts" title="3. Accounts and Registration">
              <p>
                To access most features of the Platform, you must create an account. When you register, you agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain and promptly update your information to keep it accurate.</li>
                <li>Keep your login credentials confidential.</li>
                <li>Notify us immediately of any unauthorised use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate your account if we determine, in our sole discretion, that you have violated these Terms or provided false information during registration.
              </p>
            </Section>

            <Section id="membership" title="4. Membership and Verification">
              <p>
                Expertly offers a curated verified membership for qualified finance and legal professionals. Membership is subject to an application and review process. By applying for membership, you agree to:
              </p>
              <ul>
                <li>Submit truthful and accurate details about your professional background, qualifications, and experience.</li>
                <li>Consent to identity and credential verification checks carried out by us or our authorised third-party providers.</li>
                <li>Notify us promptly of any material changes to your professional standing (e.g., loss of licence, regulatory censure).</li>
              </ul>
              <p>
                Membership fees, if applicable, are non-refundable unless otherwise stated in writing. We reserve the right to revoke membership at any time if we determine that a member has misrepresented their credentials or violated these Terms.
              </p>
            </Section>

            <Section id="content" title="5. User Content">
              <p>
                The Platform may allow you to post, upload, submit, or otherwise make available content including articles, profile information, and communications (&ldquo;User Content&rdquo;). By submitting User Content, you grant Expertly a worldwide, non-exclusive, royalty-free, sublicensable, and transferable licence to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Platform and our business.
              </p>
              <p>You represent and warrant that your User Content:</p>
              <ul>
                <li>Does not infringe any third-party intellectual property rights.</li>
                <li>Does not contain false, misleading, or deceptive statements.</li>
                <li>Complies with all applicable laws and regulations, including financial and legal professional conduct rules.</li>
                <li>Does not constitute unauthorised investment advice, legal advice, or other regulated activity.</li>
                <li>Is not defamatory, obscene, harmful, threatening, or otherwise objectionable.</li>
              </ul>
              <p>
                We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate, without notice.
              </p>
            </Section>

            <Section id="ip" title="6. Intellectual Property">
              <p>
                All content on the Platform that is not User Content — including the Expertly name, logo, design, software, text, graphics, and data — is owned by or licensed to Expertly and is protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, distribute, modify, create derivative works, publicly display, or otherwise exploit any Platform content without our prior written consent.
              </p>
            </Section>

            <Section id="prohibited" title="7. Prohibited Conduct">
              <p>You agree not to:</p>
              <ul>
                <li>Use the Platform for any unlawful purpose or in violation of any applicable regulation, including financial services laws and legal professional conduct rules.</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
                <li>Scrape, crawl, or systematically extract data from the Platform without our express written permission.</li>
                <li>Transmit any malware, viruses, or other harmful code.</li>
                <li>Attempt to gain unauthorised access to any part of the Platform or its underlying systems.</li>
                <li>Use the Platform to solicit members for competing services or to conduct unsolicited commercial communications.</li>
                <li>Post content that constitutes regulated financial or legal advice without appropriate disclosure and authorisation.</li>
                <li>Harass, abuse, or harm other users of the Platform.</li>
              </ul>
            </Section>

            <Section id="disclaimers" title="8. Disclaimers">
              <p>
                <strong>The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.</strong> To the fullest extent permitted by law, Expertly disclaims all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                Content published on the Platform by members represents the personal views of those members and does not constitute professional financial or legal advice. Expertly does not verify the accuracy of member-published content and is not responsible for any reliance you place on such content. Always seek qualified professional advice before making financial or legal decisions.
              </p>
              <p>
                Expertly does not endorse, recommend, or guarantee any member, their services, or the accuracy of their credentials beyond the scope of our verification process.
              </p>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <p>
                To the fullest extent permitted by applicable law, Expertly Global Ltd and its officers, directors, employees, agents, licensors, and service providers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising out of or in connection with:
              </p>
              <ul>
                <li>Your access to or use of (or inability to access or use) the Platform.</li>
                <li>Any conduct or content of any third party on the Platform.</li>
                <li>Any content obtained from the Platform.</li>
                <li>Unauthorised access, use, or alteration of your transmissions or content.</li>
              </ul>
              <p>
                In no event shall our total liability to you for all claims arising out of or relating to the Platform exceed the greater of (a) the amount you paid to us in the twelve months preceding the claim, or (b) one hundred US dollars (USD $100).
              </p>
            </Section>

            <Section id="indemnification" title="10. Indemnification">
              <p>
                You agree to defend, indemnify, and hold harmless Expertly Global Ltd and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with your access to or use of the Platform, your User Content, or your violation of these Terms.
              </p>
            </Section>

            <Section id="termination" title="11. Termination">
              <p>
                We may suspend or terminate your access to the Platform at any time, with or without cause, and with or without notice. Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive, including intellectual property provisions, disclaimers, indemnification, and limitations of liability.
              </p>
              <p>
                You may close your account at any time by contacting us at <a href="mailto:contact@expertly.global">contact@expertly.global</a>. Membership fees already paid are non-refundable upon termination initiated by you.
              </p>
            </Section>

            <Section id="governing" title="12. Governing Law and Dispute Resolution">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions. Any dispute arising out of or in connection with these Terms, including any question regarding their existence, validity, or termination, shall be subject to the exclusive jurisdiction of the courts of England and Wales, unless you are located in a jurisdiction where local law mandates otherwise.
              </p>
            </Section>

            <Section id="changes" title="13. Changes to These Terms">
              <p>
                We may update these Terms from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date at the top of this page and, where the changes are material, notify you via email or a prominent notice on the Platform. Your continued use of the Platform after any such change constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms, please stop using the Platform.
              </p>
            </Section>

            <Section id="contact" title="14. Contact Us">
              <p>If you have any questions about these Terms, please contact us at:</p>
              <address className="not-italic mt-3 text-brand-text-secondary text-sm leading-relaxed">
                <strong className="text-brand-navy">Expertly Global Ltd</strong><br />
                Email: <a href="mailto:contact@expertly.global">contact@expertly.global</a><br />
                Website: <Link href="/">expertly.global</Link>
              </address>
            </Section>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Read our Privacy Policy
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
