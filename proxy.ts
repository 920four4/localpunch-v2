import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Copies any cookies Supabase refreshed during getUser() onto a new response
// (e.g. a redirect). Without this, token refreshes are lost on navigation that
// results in NextResponse.redirect, causing the user to appear logged out on
// the next request.
function forwardAuthCookies(
  from: NextResponse,
  to: NextResponse,
): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })
  return to
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options }),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const redirect = (url: URL) =>
    forwardAuthCookies(supabaseResponse, NextResponse.redirect(url))

  // Public routes — landing, login, onboard, blog, SEO, legal, assets
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/onboard' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/p/') ||
    pathname === '/llms.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icons/') ||
    pathname === '/privacy-policy' ||
    pathname === '/terms'

  if (isPublic) {
    // Signed-in users hitting the marketing landing get bounced to their app
    if (pathname === '/' && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      const dest =
        profile?.role === 'admin' ? '/admin' :
        profile?.role === 'merchant' ? '/merchant' :
        '/wallet'
      return redirect(new URL(dest, request.url))
    }
    return supabaseResponse
  }

  // Require auth for all other routes
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return redirect(loginUrl)
  }

  // First-time user: only redirect to onboarding if no profile AND they're an
  // email-auth user (merchants/admins). Phone-auth customers get a profile
  // created automatically by the handle_new_user trigger with role='customer'
  // so they never need onboarding.
  if (pathname !== '/onboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    // No profile at all — only possible if trigger failed; send to onboard
    if (!profile) {
      // Phone-auth users: profile should exist; if not, just let them through to /wallet
      const isPhoneUser = user.phone && !user.email
      if (isPhoneUser) {
        return redirect(new URL('/wallet', request.url))
      }
      return redirect(new URL('/onboard', request.url))
    }

    // Role-based protection for /merchant and /admin
    if (pathname.startsWith('/admin') && profile.role !== 'admin') {
      return redirect(new URL('/wallet', request.url))
    }

    if (
      pathname.startsWith('/merchant') &&
      profile.role !== 'merchant' &&
      profile.role !== 'admin'
    ) {
      return redirect(new URL('/wallet', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
