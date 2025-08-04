import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;
  
  // Redirect www to non-www for better SEO
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    const url = request.nextUrl.clone();
    url.host = newHost;
    return NextResponse.redirect(url, 301);
  }
  
  // Ensure trailing slash consistency (optional)
  if (pathname !== '/' && !pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname + '/';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 