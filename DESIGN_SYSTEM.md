# Expertly — Design System

> **Reference for all future UI work.**
> Every new page, component, and section must follow these guidelines to maintain visual consistency across the portal.
>
> Reference screenshots live in [`design/references/`](./design/references/README.md).

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Shadows & Elevation](#shadows--elevation)
6. [Button Variants](#button-variants)
7. [Form Inputs](#form-inputs)
8. [Badge Components](#badge-components)
9. [Card Patterns](#card-patterns)
10. [Section Patterns](#section-patterns)
11. [Page Layout Patterns](#page-layout-patterns)
12. [Navbar & Footer](#navbar--footer)
13. [Homepage Sections](#homepage-sections)
14. [Accessibility](#accessibility)
15. [Component File Map](#component-file-map)

---

## Design Philosophy

Expertly is a **premium professional network** for finance and legal experts. The design language is:

- **Dark navy primary** — conveys authority, trust, and formality
- **Blue accent** — modern, interactive, and approachable (replaces gold for CTAs)
- **Clean surfaces** — white cards on near-white backgrounds, generous whitespace
- **Typography-first** — clear hierarchy using weight and size, not decoration
- **Mobile-first, responsive** — every component works from 375px upward

The overall aesthetic references high-quality professional SaaS platforms (think Bloomberg, Chambers, LinkedIn Pro). Not startup-playful; not corporate-stale.

---

## Color Palette

All colors are defined as Tailwind tokens in `apps/web/tailwind.config.ts` under the `brand.*` namespace.

### Primary Backgrounds

| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#0B1929` | Navbar, hero, footer, CTA strips, dark sections |
| `brand-navy-medium` | `#102038` | Mobile nav panel, hover states on dark bg, dark cards |
| `brand-navy-light` | `#1B3557` | Borders/dividers on dark backgrounds, tertiary dark elements |

### Primary Accent — Blue

| Token | Hex | Usage |
|---|---|---|
| `brand-blue` | `#2563EB` | All CTA buttons, active links, section labels, focus rings |
| `brand-blue-light` | `#3B82F6` | Hover on dark-bg buttons; accent text in hero |
| `brand-blue-dark` | `#1D4ED8` | Pressed/active state for blue buttons |
| `brand-blue-subtle` | `#EFF6FF` | Light tinted background behind blue badge elements |

> **Rule:** Every interactive element (button, link hover, focus ring, badge) uses the blue accent. Gold is NOT used for CTAs.

### Secondary Accent — Amber/Gold

| Token | Hex | Usage |
|---|---|---|
| `brand-gold` | `#F59E0B` | Star ratings, highlight decorative chips — **not CTAs** |
| `brand-gold-light` | `#FCD34D` | Hover on gold elements |
| `brand-gold-dark` | `#D97706` | Pressed gold states |

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `brand-surface` | `#F8FAFC` | Default page background |
| `brand-surface-alt` | `#F1F5F9` | Alternating sections (stats bar, zebra-stripe sections) |
| `brand-card` | `#FFFFFF` | Card backgrounds, modal backgrounds |

### Text

| Token | Hex | Usage |
|---|---|---|
| `brand-text` | `#0F172A` | Primary body text, headings on light bg |
| `brand-text-secondary` | `#475569` | Supporting text, descriptions |
| `brand-text-muted` | `#94A3B8` | Placeholders, captions, meta info |

### On Dark Backgrounds

When text sits on `brand-navy` or similar dark backgrounds:

| Style | Tailwind class | Usage |
|---|---|---|
| Primary white | `text-white` | H1/H2 headings in hero |
| Dimmed white | `text-white/80` | Subheadings, important body text |
| Muted white | `text-white/60` | Paragraph text on dark bg |
| Faint white | `text-white/40` | Trust signals, captions |
| Interactive nav links | `text-white/70` | Default nav link; `hover:text-white` |

---

## Typography

### Font Family

**Inter** — loaded via `next/font/google` in the root layout.

```css
font-family: 'Inter', system-ui, sans-serif;
```

Tailwind token: `font-sans` (mapped to `var(--font-inter)` in `tailwind.config.ts`).

### Scale

| Use | Classes | Notes |
|---|---|---|
| Hero H1 | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight` | `leading-[1.12]` |
| Section H2 | `text-2xl sm:text-3xl font-bold` | On light bg: `text-brand-navy` |
| Card H3 | `text-base sm:text-lg font-semibold` | `text-brand-navy` or `text-brand-text` |
| Section label | `.section-label` | `text-xs font-semibold uppercase tracking-widest text-brand-blue` |
| Body (default) | `text-sm sm:text-base` | `text-brand-text` or `text-gray-500` |
| Caption / meta | `text-xs` | `text-brand-text-muted` or `text-gray-400` |

### Typographic hierarchy example (section header)

```tsx
<p className="section-label mb-2">Our Network</p>
<h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Featured Members</h2>
<p className="mt-2 text-gray-500 text-sm sm:text-base">Supporting description here.</p>
```

---

## Spacing & Layout

### Container

All content sections use the same container:

```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Section Vertical Padding

| Context | Classes |
|---|---|
| Standard section | `py-20` |
| Compact section (stats bar, CTA strip) | `py-10` or `py-16` |
| Hero | `py-20 sm:py-28` |

### Grid Patterns

| Grid | Classes |
|---|---|
| Feature cards (3-up) | `grid grid-cols-1 sm:grid-cols-3 gap-6` |
| Article cards (3-up) | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` |
| Member teaser grid (6-up) | `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4` |
| Stats bar (4-up) | `grid grid-cols-2 sm:grid-cols-4 gap-8` |
| 2-column content | `grid grid-cols-1 lg:grid-cols-2 gap-8` |

### Section Header Pattern

All section headers follow this layout:

```tsx
<div className="flex items-end justify-between mb-10">
  <div>
    <p className="section-label mb-2">Category Label</p>
    <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Section Title</h2>
  </div>
  {/* "View all" link — hidden on mobile */}
  <Link href="/page" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors">
    View all <ArrowIcon />
  </Link>
</div>

{/* Mobile CTA at bottom */}
<div className="mt-8 sm:hidden text-center">
  <Link href="/page" className="...">View all items →</Link>
</div>
```

---

## Shadows & Elevation

| Token | CSS | Usage |
|---|---|---|
| `shadow-card` | `0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)` | Default card resting state |
| `shadow-card-hover` | `0 4px 16px rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)` | Cards on hover / dropdown menus |
| `shadow-2xl` (Tailwind default) | — | Hero search bar |

Cards use `hover:-translate-y-0.5 transition-all duration-200` alongside `hover:shadow-md` for the lift effect.

---

## Button Variants

All button utility classes are defined in `apps/web/app/globals.css`.

### `.btn-primary`
**Main CTA on light backgrounds.** Blue fill, white text.
```html
<button class="btn-primary">Apply for Membership</button>
```

### `.btn-primary-dark`
**CTA on dark backgrounds (nav, hero, footer).** Same blue, focus ring offset by navy.
```html
<a class="btn-primary-dark" href="/application">Become a Member</a>
```

### `.btn-outline`
**Secondary action on light backgrounds.** White fill, gray border.
```html
<button class="btn-outline">Cancel</button>
```

### `.btn-outline-white`
**Ghost button on dark backgrounds.** Transparent, white border.
```html
<button class="btn-outline-white">Learn more</button>
```

### Inline CTA Links
For "View all" type links on light backgrounds:
```html
<a class="text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors">
  View all →
</a>
```

---

## Form Inputs

### `.input-base`
```html
<input class="input-base" placeholder="Enter value" />
<select class="input-base">...</select>
<textarea class="input-base" />
```

Characteristics: rounded-lg, gray-200 border, blue focus ring, `brand-text-muted` placeholder.

### Hero search bar selects
Special inline style inside white card:
```
pl-9 pr-4 py-3 text-sm text-brand-text bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none cursor-pointer
```

---

## Badge Components

All badges are in `apps/web/components/shared/Badge.tsx`.

### `<VerifiedBadge />`
Blue pill — displayed on verified members.
```tsx
<VerifiedBadge size="sm" />   // smaller, for cards
<VerifiedBadge size="md" />   // default, for profile headers
```
Style: `bg-blue-50 text-blue-700 border-blue-100` with a checkmark shield icon.

### `<TierBadge tier="seasoned" />`
Amber pill — member tier indicator.
- `seasoned`: amber (`bg-amber-50 text-amber-700 border-amber-200`)
- `budding`: gray (`bg-gray-50 text-gray-600 border-gray-200`)

### `<StatusBadge label="Under Review" variant="warning" />`
Generic status pill. Variants: `default | success | warning | danger | info`.

---

## Card Patterns

### Member Card (`MemberCard`)

Vertical card. Used in member directories and homepage featured section.

```
bg-white rounded-2xl border border-gray-100 shadow-sm
hover: shadow-md + -translate-y-0.5
```

Contents (centered):
1. Avatar (64×64 circle; fallback = navy bg with initials)
2. Name — `font-semibold text-brand-navy text-sm`
3. Designation — `text-xs text-gray-500`
4. Primary service — `text-xs font-medium text-brand-blue`
5. Location (pin icon + city, country) — `text-xs text-gray-400`
6. Badges row: `<VerifiedBadge>` + `<TierBadge>`

Variants:
- `teaser` — shows limited info, no "View profile" CTA (for guests)
- `full` — adds "View profile →" link after badges

### Article Card (`ArticleCard`)

Vertical card with cover image.

```
bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden
hover: shadow-card-hover + -translate-y-0.5
```

Contents:
1. Cover image — `aspect-[16/9]` or `aspect-[3/2]`, `object-cover`
2. Category chip — `bg-brand-blue-subtle text-brand-blue text-xs font-medium px-2.5 py-1 rounded-full`
3. Title — `font-semibold text-brand-navy text-base leading-snug`
4. Excerpt — 2-line clamp, `text-sm text-gray-500`
5. Meta row: Author name + read time + date

### Event Card (`UpcomingEventsSection`)

Horizontal card with a colored date column on the left.

```
bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden flex
```

Date column:
- `bg-brand-blue text-white w-20 flex-shrink-0 flex flex-col items-center justify-center`
- Large day number (`text-3xl font-bold`) + abbreviated month (`text-xs uppercase tracking-wider`)

Content column (remainder):
- Event name (bold, `text-brand-navy`)
- Location or format pill
- Time / duration
- "Register" or "Learn more" link

---

## Section Patterns

### Dark Band Section
```tsx
<section className="bg-brand-navy ...">
  {/* navy bg, white text */}
</section>
```

### Light Alternating Sections
- Odd sections: `bg-white`
- Even sections: `bg-brand-surface` (`#F8FAFC`)
- Stats/compact bars: `bg-brand-surface-alt` (`#F1F5F9`)

### Hero (always dark)
`bg-brand-navy` + grid overlay (`opacity-[0.04]`) + radial blue glow (`bg-brand-blue/10 blur-3xl`).

### Feature Cards Band
`bg-brand-navy-medium` — sits directly below the hero, creating a continuous dark section.

### CTA Strip
```tsx
<section className="bg-brand-navy py-16">
  <h2 className="text-white">CTA Heading</h2>
  <p className="text-white/60">Supporting text.</p>
  <a className="btn-primary">Primary CTA</a>
</section>
```

---

## Page Layout Patterns

### Full-width with centered container

Every page section:
```tsx
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* content */}
  </div>
</section>
```

### Auth / Forms (centered card)

```tsx
<div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center px-4">
  <div className="relative w-full max-w-md">
    {/* logo */}
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10">
      {/* form */}
    </div>
  </div>
</div>
```

### Member/Ops Dashboard (sidebar + main)

_(Reserved for future implementation)_

```
Sidebar: bg-brand-navy, 240px fixed
Main: bg-brand-surface, flex-1, overflow-y-auto
```

---

## Navbar & Footer

### Navbar

File: `apps/web/components/layout/Navbar.tsx` (server) + `NavbarClient.tsx` (client)

- Background: `bg-brand-navy` sticky, `z-50`
- Height: `h-16`
- Border: `border-b border-white/10`
- Logo: blue `bg-brand-blue` box with bold "E", then "Expertly" text (hidden on mobile)
- Nav links: `text-white/70 hover:text-white text-sm font-medium`
- CTA button: `bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg px-4 py-2 text-sm font-semibold`
- "Log In" link: `text-white/70 hover:text-white`
- Mobile: hamburger toggle → `bg-brand-navy-medium` slide-down panel

### Footer

File: `apps/web/components/layout/Footer.tsx`

- Background: `bg-brand-navy`
- 3 columns (desktop): About / Quick Links / Contact
- Text: `text-white/60` for body, `text-white` for headings
- Links: `hover:text-white transition-colors`
- Border-top: `border-t border-white/10`

---

## Homepage Sections

The homepage renders sections in this order (all in `(platform)/page.tsx`):

| # | Component | Background | Notes |
|---|---|---|---|
| 1 | `HeroSection` | `bg-brand-navy` | Dark, search bar, `'use client'` |
| 2 | `FeatureCardsSection` | `bg-brand-navy-medium` | 3 dark glass cards |
| 3 | `StatsSection` | `bg-brand-surface-alt` | 4 stats, light band |
| 4 | `FeaturedMembersSection` | `bg-white` | 6-up member grid, data from API |
| 5 | `LatestArticlesSection` | `bg-brand-surface` | 3-up article cards, data from API |
| 6 | `UpcomingEventsSection` | `bg-white` | Horizontal event cards, data from API |
| 7 | CTA Strip (inline) | `bg-brand-navy` | "Ready to join?" + Apply button |

Sections 4, 5, 6 render `null` if data is empty (graceful degradation).

---

## Accessibility

- All decorative SVGs must have `aria-hidden`
- Interactive elements must have visible focus rings (`focus:ring-2 focus:ring-brand-blue`)
- Color contrast: all text on dark bg uses at minimum `text-white/60` (~4.5:1 for body text)
- Images: always provide meaningful `alt` text; avatar fallbacks use `aria-label`
- Buttons with icon-only content use `aria-label`

---

## Component File Map

```
apps/web/
├── app/
│   ├── globals.css                    # Button utilities, section-label, input-base
│   ├── (auth)/auth/page.tsx           # Sign-in page (LinkedIn OAuth)
│   ├── (platform)/
│   │   ├── layout.tsx                 # Navbar + Footer wrapper
│   │   └── page.tsx                   # Homepage (ISR 5 min)
│   ├── (member)/layout.tsx            # Auth guard: member role
│   └── (ops)/layout.tsx               # Auth guard: ops/backend_admin
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # Server component — reads session/role
│   │   ├── NavbarClient.tsx           # Client component — mobile menu, user dropdown
│   │   └── Footer.tsx                 # Static footer
│   ├── home/
│   │   ├── HeroSection.tsx            # 'use client' — search bar form
│   │   ├── FeatureCardsSection.tsx    # 3 dark glass cards
│   │   ├── StatsSection.tsx           # 4 stats counter bar
│   │   ├── FeaturedMembersSection.tsx # 6-up member grid
│   │   ├── LatestArticlesSection.tsx  # 3-up article cards
│   │   └── UpcomingEventsSection.tsx  # Horizontal event cards
│   └── shared/
│       ├── Badge.tsx                  # VerifiedBadge, TierBadge, StatusBadge
│       ├── MemberCard.tsx             # teaser / full variants
│       └── ArticleCard.tsx            # Cover image card
│
└── tailwind.config.ts                 # All brand.* color tokens
```
