import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

interface AuthUser {
  userId: string;
  role: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);

  if (!user) {
    throw new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return user;
}

export function requireAdmin(request: NextRequest): AuthUser {
  const user = requireAuth(request);

  if (user.role !== 'ADMIN') {
    throw new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return user;
}
