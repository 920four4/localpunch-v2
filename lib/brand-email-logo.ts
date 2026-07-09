import { SITE_URL } from '@/lib/site'

/** Hosted punch-ring mark for Supabase / transactional email templates (34×34). */
export const EMAIL_LOGO_IMG = `<img src="${SITE_URL}/apple-icon" width="34" height="34" alt="LocalPunch" style="display:block;border-radius:8px;" />`

/** Inline SVG fallback when images are blocked (same punch-ring mark). */
export const EMAIL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 512 512" role="img" aria-label="LocalPunch"><rect x="7" y="7" width="498" height="498" rx="95" fill="#FFE566" stroke="#1a1a1a" stroke-width="14"/><circle cx="256" cy="256" r="154" fill="none" stroke="#1a1a1a" stroke-width="61"/></svg>`
