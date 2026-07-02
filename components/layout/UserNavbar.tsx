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
      className="fixed w-full top-0 z-40 h-16 bg-[#060a14]/60 backdrop-blur-xl border-b border-white/5 shadow-sm"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6 relative z-10 max-w-full">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.3)] border border-white/10 group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-all duration-300">
              <Zap className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">
              {appName}
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
            <NotificationBell />
          </div>

          {userName && (
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10 h-8">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30 shadow-sm ring-1 ring-white/10">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-slate-300">
                {userName}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
