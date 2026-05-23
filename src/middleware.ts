import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_status')
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!authCookie && !isLoginPage && !request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
