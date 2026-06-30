'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { LayoutDashboard, History, ShieldCheck, User, X, Zap } from 'lucide-react';

const navLinks = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Payment History',
    href: '/dashboard/history',
    icon: <History className="w-5 h-5" />,
  },
  {
    name: 'KYC Verification',
    href: '/kyc',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: <User className="w-5 h-5" />,
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const isActive = (href: string) => pathname === href;

  const linkList = (
    <nav className="space-y-2 mt-4 relative z-10">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
              ${active ? 'text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {active && (
              <motion.div
                layoutId="active-sidebar-tab"
                className="absolute inset-0 bg-gradient-to-r from-aurora-cyan/20 to-aurora-indigo/20 border border-aurora-cyan/30 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <span className={active ? "text-aurora-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}>
                {link.icon}
              </span>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 glass border-r border-white/5 p-4 overflow-y-auto bg-slate-950/30 backdrop-blur-3xl z-30">
        {linkList}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-64 h-full glass bg-slate-900/90 p-4 shadow-2xl border-r border-white/10"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-aurora-indigo flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-black text-white">
                    Zerofx.club
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {linkList}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
