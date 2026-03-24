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
      { label: 'Apply for Membership', href: '/application' },
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
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Logo + tagline */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-2xl font-bold text-white">Expertly</span>
            <span className="text-2xl font-bold text-brand-blue-light">.</span>
          </Link>
          <p className="mt-2 text-sm text-gray-400 max-w-xs">
            The professional network for finance and legal experts.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
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
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Expertly. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built for finance &amp; legal professionals worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
