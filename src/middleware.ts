import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'mo_session';
const PROTECTED = ['/dashboard', '/orders', '/products'];

// Lightweight route gate: presence-checks the session cookie and redirects.
// Real cryptographic verification happens in the API handlers (requireUser).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (pathname === '/login' && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/products/:path*', '/login'],
};
