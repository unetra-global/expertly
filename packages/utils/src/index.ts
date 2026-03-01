/**
 * Convert a string to a URL-friendly slug.
 * Handles unicode, removes special chars, collapses hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric
    .trim()
    .replace(/[\s_-]+/g, '-')        // collapse whitespace/underscores to hyphen
    .replace(/^-+|-+$/g, '');        // strip leading/trailing hyphens
}

/**
 * Count words in a string (splits on whitespace).
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Extract a plain-text excerpt from HTML or markdown content.
 * Strips tags, collapses whitespace, truncates to maxLength chars.
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  const plain = content
    .replace(/<[^>]+>/g, ' ')  // strip HTML tags
    .replace(/#{1,6}\s+/g, '') // strip markdown headings
    .replace(/[*_`~]/g, '')    // strip markdown emphasis
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;

  const truncated = plain.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '…';
}

/**
 * Format a fee range for display.
 * e.g. formatFee(100, 200, 'USD') => '$100–$200 USD'
 *      formatFee(150, undefined, 'GBP') => '£150 GBP'
 */
export function formatFee(
  feeFrom: number,
  feeTo: number | undefined,
  currency: string,
): string {
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
  };

  const symbol = symbols[currency] ?? '';
  const fmt = (n: number) => `${symbol}${n.toLocaleString()}`;

  if (feeTo && feeTo !== feeFrom) {
    return `${fmt(feeFrom)}–${fmt(feeTo)} ${currency}`;
  }
  return `${fmt(feeFrom)} ${currency}`;
}

/**
 * Calculate estimated read time in minutes based on word count.
 * Assumes average reading speed of 200 wpm.
 */
export function calculateReadTime(content: string, wordsPerMinute = 200): number {
  const words = countWords(content);
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Generate a random alphanumeric suffix of the given length.
 * Used for creating unique slugs.
 */
export function randomSuffix(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
