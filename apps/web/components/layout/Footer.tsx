import Link from 'next/link';

const NAV_COLUMNS = [
  {
    heading: 'About Expertly',
    links: [
      { label: 'Our Mission', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Membership Benefits', href: '/membership' },
      { label: 'Verified Experts', href: '/verified' },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { label: 'Member Directory', href: '/members' },
      { label: 'Latest Articles', href: '/articles' },
      { label: 'Upcoming Events', href: '/events' },
      { label: 'Apply for Membership', href: '/onboarding' },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { label: 'contact@expertly.global', href: 'mailto:contact@expertly.global' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/expertly-global' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Brand statement */}
        <div className="mb-14">
          <Link href="/" className="inline-flex items-baseline gap-0.5 group">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-white/90 transition-colors">
              Expertly
            </span>
            <span className="text-3xl sm:text-4xl font-black text-brand-gold">.</span>
          </Link>
          <p className="mt-3 text-sm sm:text-base text-white/40 max-w-sm leading-relaxed">
            The curated professional network for verified finance &amp; legal experts worldwide.
          </p>
        </div>

        {/* 3-column links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 border-t border-white/[0.08] pt-10">
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Expertly. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Finance &amp; legal professionals · Verified &amp; trusted
          </p>
        </div>
      </div>
    </footer>
  );
}
