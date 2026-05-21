import { SITE_URL } from '@/lib/site'

/** Hosted punch-card mark for Supabase / transactional email templates (34×34). */
export const EMAIL_LOGO_IMG = `<img src="${SITE_URL}/apple-icon" width="34" height="34" alt="LocalPunch" style="display:block;border-radius:8px;border:1px solid #E0CF4A;" />`

/** Inline SVG fallback when images are blocked (same punch-card mark). */
export const EMAIL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 32 32" role="img" aria-label="LocalPunch"><rect x="3" y="8" width="26" height="17" rx="4" fill="#FFE566" stroke="#1a1a1a" stroke-width="2"/><rect x="5.5" y="10.5" width="21" height="12" rx="2" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><circle cx="10.5" cy="16.5" r="3" fill="#FFE566" stroke="#1a1a1a" stroke-width="1.25"/><circle cx="16" cy="16.5" r="3" fill="#FFE566" stroke="#1a1a1a" stroke-width="1.25"/><circle cx="21.5" cy="16.5" r="3" fill="#F5F4EF" stroke="#C9C5BA" stroke-width="1.25"/><path d="M8.8 16.6 L10 18 L12.2 15.2" stroke="#1a1a1a" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.3 16.6 L15.5 18 L17.7 15.2" stroke="#1a1a1a" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`
