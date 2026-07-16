'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { Menu, LogOut } from 'lucide-react';
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

  const appName = 'Zerofx.club';

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed w-full top-0 z-40 h-16 navbar-light"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6 relative z-10 max-w-full">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter gradient-text hidden sm:block transition-all duration-300">
              {appName}
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer">
            <NotificationBell />
          </div>

          {userName && (
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 h-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {userName}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
