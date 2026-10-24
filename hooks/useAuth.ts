'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  totalPaid: number;
  createdAt: string;
  kycStatus: string | null;
  kyc?: {
    id: string;
    status: string;
    selfieUrl?: string;
    rejectionReason?: string;
  } | null;
  unreadNotifications: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users/me');
      setUser(data);
      setError(null);
    } catch {
      setUser(null);
      setError('Not authenticated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      // Clear the cookie by setting it to expire immediately
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    } catch {
      // Cookie clearing is best-effort
    }
    setUser(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    loading,
    error,
    logout,
    refetch: fetchUser,
  };
}
