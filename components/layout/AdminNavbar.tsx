'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { Menu, LogOut, ShieldAlert } from 'lucide-react';
import NotificationBell from '@/components/features/NotificationBell';

interface AdminNavbarProps {
  adminName?: string;
}

export default function AdminNavbar({ adminName = 'Admin' }: AdminNavbarProps) {
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
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_4px_10px_rgba(239,68,68,0.3)] border border-white/10 group-hover:shadow-[0_4px_15px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none group-hover:text-red-400 transition-colors">
                {appName}
              </span>
              <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Admin</span>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
            <NotificationBell />
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10 h-8">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm border border-red-500/30 shadow-sm ring-1 ring-white/10">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-slate-300">
              {adminName}
            </span>
          </div>

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
