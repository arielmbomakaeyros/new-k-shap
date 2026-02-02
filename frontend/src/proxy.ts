import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/first-login',
  '/unauthorized',
];

// Routes that require Kaeyros platform roles
const KAEYROS_ROUTES = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read auth cookies set by the Zustand login/logout actions
  const isAuthenticated = request.cookies.get('is_authenticated')?.value === 'true';
  const isKaeyrosUser = request.cookies.get('is_kaeyros_user')?.value === '1';

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isHomePage = pathname === '/';

  // Unauthenticated user trying to access protected route -> redirect to login
  if (!isAuthenticated && !isPublicRoute && !isHomePage) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on login/signup page -> redirect to appropriate dashboard
  if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const destination = isKaeyrosUser ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Authenticated user on home page -> redirect to appropriate dashboard
  if (isAuthenticated && isHomePage) {
    const destination = isKaeyrosUser ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Company user trying to access Kaeyros admin routes -> redirect to dashboard
  if (isAuthenticated && !isKaeyrosUser && KAEYROS_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
