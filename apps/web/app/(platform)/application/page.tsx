/**
 * /application — Membership Application
 *
 * The layout.tsx guard above already ensures:
 *   • User is authenticated
 *   • User has a LinkedIn identity linked
 *
 * The full multi-step form will be implemented in a future session.
 * This placeholder provides a baseline UI so routing works end-to-end.
 */
export const metadata = {
  title: 'Apply for Membership | Expertly',
  description:
    'Apply to join the Expertly network of verified finance and legal professionals.',
};

export default function ApplicationPage() {
  return (
    <main className="min-h-screen bg-brand-surface">
      {/* Hero band */}
      <div className="bg-brand-navy py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">Membership Application</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Apply to Join Expertly
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-xl mx-auto leading-relaxed">
            Complete the form below to be considered for verified membership
            in our global finance and legal network.
          </p>
        </div>
      </div>

      {/* Application form area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress indicator (placeholder) */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {['Personal Details', 'Professional Info', 'Review'].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                    i === 0
                      ? 'bg-brand-blue border-brand-blue text-white'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i === 0 ? 'text-brand-navy' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
                {i < 2 && (
                  <div className="w-8 sm:w-16 h-px bg-gray-200 mx-1" />
                )}
              </div>
            ),
          )}
        </div>

        {/* Placeholder card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-blue-subtle flex items-center justify-center mx-auto mb-5">
            <svg
              className="h-8 w-8 text-brand-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-brand-navy mb-2">
            Application Form Coming Soon
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            The full membership application form is being built. Your account
            is verified and LinkedIn-connected — you&apos;re ready to apply
            once it&apos;s live.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-xs font-semibold text-green-700">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            LinkedIn verified — you&apos;re all set
          </div>
        </div>
      </div>
    </main>
  );
}
