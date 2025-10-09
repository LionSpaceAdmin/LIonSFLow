import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('lionsflow-auth')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Allow requests to the login page, API routes, and Next.js internal paths
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // If the user is authenticated and trying to access the login page, redirect to home
  if (isAuthenticated && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|favicon.ico|.*\\..*).*)',
  ],
};
