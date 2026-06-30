'use client';

import React from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { Menu, LogOut, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminNavbarProps {
  adminName?: string;
}

export default function AdminNavbar({ adminName }: AdminNavbarProps) {
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
    <nav className="sticky top-0 z-40 h-16 glass border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <Link href="/admin" className="flex items-center gap-2 group">
            <span className="text-xl font-black text-white tracking-tight drop-shadow-sm group-hover:text-aurora-purple transition-colors">
              {appName}
            </span>
            <span className="bg-aurora-purple/20 border border-aurora-purple/50 text-aurora-purple text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              Admin
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {adminName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/5">
              <ShieldAlert className="w-4 h-4 text-aurora-purple" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {adminName}
              </span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
