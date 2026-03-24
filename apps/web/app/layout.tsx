import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Expertly — The Professional Network for Finance & Legal Experts',
    template: '%s | Expertly',
  },
  description:
    'Connect with verified finance and legal professionals. Read expert articles. Discover events.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://expertly.global',
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-brand-surface min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
