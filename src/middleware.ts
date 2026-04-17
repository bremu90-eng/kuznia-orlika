import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_CLIENT = ['/konto', '/zapisy']
const PROTECTED_PANEL = ['/panel']
const AUTH_PATHS = ['/rejestracja', '/logowanie', '/reset-hasla', '/ustaw-nowe-haslo']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  let userRole: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    userRole = profile?.role ?? null
  }

  if (user && AUTH_PATHS.some(p => pathname.startsWith(p))) {
    const to = (userRole === 'admin' || userRole === 'trainer') ? '/panel' : '/konto'
    return NextResponse.redirect(new URL(to, request.url))
  }

  if (PROTECTED_CLIENT.some(p => pathname.startsWith(p)) && !user) {
    const url = new URL('/logowanie', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (PROTECTED_PANEL.some(p => pathname.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL('/logowanie', request.url))
    if (userRole !== 'trainer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/konto', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'],
}
