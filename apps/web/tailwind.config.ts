import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './stores/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // ── Backgrounds ────────────────────────────────────────────
          // Primary dark navy — navbar, hero, footer, dark sections
          navy: '#0B1929',
          'navy-medium': '#102038',   // slightly lighter — hover states on dark bg
          'navy-light': '#1B3557',    // tertiary — used for dark cards / borders on dark bg

          // ── Primary accent ─────────────────────────────────────────
          // Blue — all interactive elements: CTAs, links, active states
          blue: '#2563EB',
          'blue-light': '#3B82F6',    // hover
          'blue-dark': '#1D4ED8',     // pressed / active
          'blue-subtle': '#EFF6FF',   // tinted background behind blue elements

          // ── Secondary accent ───────────────────────────────────────
          // Amber — star ratings, highlight chips, minimal decorative use
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
          'gold-dark': '#D97706',

          // ── Surfaces ───────────────────────────────────────────────
          surface: '#F8FAFC',         // page background (near-white)
          'surface-alt': '#F1F5F9',   // alternating section background
          card: '#FFFFFF',            // card backgrounds

          // ── Text ───────────────────────────────────────────────────
          text: '#0F172A',            // primary body text
          'text-secondary': '#475569', // secondary/supporting text
          'text-muted': '#94A3B8',    // placeholders, captions
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        nav: '0 1px 0 0 rgb(255 255 255 / 0.08)',
      },
      backgroundImage: {
        'hero-grid':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [typography],
};

export default config;
