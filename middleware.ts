import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // IMPORTANT: First check if this is an auth route - if yes, ignore immediately
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/',
    '/AI-Assistant',
    '/api/seed',
    '/api/gemini',
  ];
  
  // Check if the path is public or a system path
  if (
    publicPaths.includes(path) || 
    path.includes('favicon') ||
    path.includes('_next')
  ) {
    return NextResponse.next();
  }
  
  // For all other paths, check authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (path.startsWith('/director') && token.role !== 'MEDICAL_DIRECTOR') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/paramedic') && token.role !== 'PARAMEDIC') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth (NextAuth API routes)
     * 2. Static files (_next, images, favicon, etc)
     * 3. Debug endpoints (like _vercel)
     */
    '/((?!api/auth|_next|_vercel|.*\\..*|favicon.ico).*)',
  ],
};