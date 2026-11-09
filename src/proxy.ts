// proxy.ts
// Runs on every request to enforce authentication and allowlist
// (Replaces the deprecated middleware.ts convention in Next.js 16+)

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/access-denied']

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // If user is logged in and allowed, redirect away from login
    if (user && pathname === '/login') {
      const allowed = isAllowedEmail(user.email ?? '')
      if (allowed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return supabaseResponse
  }

  // No user — redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // User exists — check allowlist
  const allowed = isAllowedEmail(user.email ?? '')
  if (!allowed) {
    return NextResponse.redirect(new URL('/access-denied', request.url))
  }

  return supabaseResponse
}

function isAllowedEmail(email: string): boolean {
  const allowed = [
    process.env.ALLOWED_EMAIL_1?.toLowerCase().trim() ?? '',
    process.env.ALLOWED_EMAIL_2?.toLowerCase().trim() ?? '',
  ]
  return allowed.includes(email.toLowerCase().trim())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
