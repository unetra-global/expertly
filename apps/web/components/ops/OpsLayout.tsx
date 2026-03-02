'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/ops', icon: '◈' },
  { label: 'Applications', href: '/ops/applications', icon: '📋' },
  { label: 'Members', href: '/ops/members', icon: '👥' },
  { label: 'Articles', href: '/ops/articles', icon: '📝' },
  { label: 'Events', href: '/ops/events', icon: '📅' },
  { label: 'Seat Allocations', href: '/ops/seats', icon: '🪑' },
  { label: 'Regulatory', href: '/ops/regulatory', icon: '📡' },
  { label: 'Broadcast', href: '/ops/broadcast', icon: '📢', adminOnly: true },
  { label: 'Admin', href: '/ops/admin', icon: '⚙️', adminOnly: true },
];

interface OpsLayoutProps {
  children: React.ReactNode;
  /** Pass true for backend_admin routes to show admin-only nav items */
  isAdmin?: boolean;
}

export default function OpsLayout({ children, isAdmin = true }: OpsLayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (href: string) => {
    if (href === '/ops') return pathname === '/ops';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col">
        {/* Top */}
        <div className="px-5 py-5 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Ops Dashboard
          </p>
          <p className="text-sm text-white font-medium truncate">
            {user?.email ?? '—'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="w-5 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="font-semibold text-slate-900">Expertly Ops</h1>
          <span className="text-sm text-slate-500">{user?.email}</span>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
