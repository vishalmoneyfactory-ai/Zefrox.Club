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
      className="sticky top-0 z-40 h-16 glass border-b border-white/5 backdrop-blur-2xl bg-slate-950/50"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-aurora-indigo flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block">{appName}</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          {userName && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-aurora-cyan font-bold text-sm border border-aurora-cyan/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-200">
                {userName}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
