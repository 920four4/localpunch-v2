// Preview-only gate for the Nov 17 draft fixture.
// Production (VERCEL_ENV=production) and local dev (unset) never match.

export const PREVIEW_DRAFT_FIXTURE_SLUG = 'stop-punch-card-cheating'
export const PREVIEW_DRAFT_FIXTURE_PATH = `/blog/${PREVIEW_DRAFT_FIXTURE_SLUG}`

export function isPreviewDraftFixtureEnabled(
  env: string | undefined = process.env.VERCEL_ENV,
): boolean {
  return env === 'preview'
}

export function isPreviewDraftFixtureRequest(
  pathname: string,
  env: string | undefined = process.env.VERCEL_ENV,
): boolean {
  return isPreviewDraftFixtureEnabled(env) && pathname === PREVIEW_DRAFT_FIXTURE_PATH
}
