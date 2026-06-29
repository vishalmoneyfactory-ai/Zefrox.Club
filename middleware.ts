import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');

async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Public routes — always accessible
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth')
  ) {
    // If logged in user tries to access login, redirect based on role
    if (pathname === '/login' && token) {
      const decoded = await verifyTokenEdge(token);
      if (decoded) {
        const redirectUrl = decoded.role === 'ADMIN' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  // API routes (except auth) require valid JWT
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Admin API routes require ADMIN role
    if (pathname.startsWith('/api/admin') && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Admin pages require ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // Protected user routes: /dashboard, /kyc, /profile
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/kyc') ||
    pathname.startsWith('/profile')
  ) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = await verifyTokenEdge(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/kyc/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
