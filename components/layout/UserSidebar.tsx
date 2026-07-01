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
              ${active ? 'text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}
            `}
          >
            {active && (
              <motion.div
                layoutId="active-sidebar-tab"
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <span className={active ? "text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" : ""}>
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
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white/70 border-r border-slate-200/50 p-4 overflow-y-auto backdrop-blur-xl z-30">
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-64 h-full bg-white p-4 shadow-2xl border-r border-slate-200"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-black text-slate-900">
                    Zerofx.club
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
