'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useUIStore } from '@/store/uiStore';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotificationsLocal] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setNotifications, setUnreadCount } = useUIStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/notifications');
      setNotificationsLocal(data);
      setNotifications(data);
      const unread = data.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // Silently fail on notification fetch
    } finally {
      setLoading(false);
    }
  }, [setNotifications, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    intervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/api/users/notifications');
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotificationsLocal(updated);
      setNotifications(updated);
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, [notifications, setNotifications, setUnreadCount]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    refetch: fetchNotifications,
  };
}
