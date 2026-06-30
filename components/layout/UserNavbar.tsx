'use client';

import React from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import NotificationBell from '@/components/features/NotificationBell';

interface UserNavbarProps {
  userName?: string;
}

export default function UserNavbar({ userName }: UserNavbarProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
    window.location.href = '/login';
  };

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Zerofx.club';

  return (
    <nav className="sticky top-0 z-40 h-16 glass border-b border-slate-200/50">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">{appName}</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          {userName && (
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {userName}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

