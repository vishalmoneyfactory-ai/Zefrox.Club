'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { Menu, LogOut, Zap } from 'lucide-react';
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
      className="sticky top-0 z-40 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.2)] group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">{appName}</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          {userName && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {userName}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
