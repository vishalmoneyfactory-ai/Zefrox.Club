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
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group
              ${active ? 'text-blue-800 shadow-sm' : 'text-slate-500 hover:text-blue-600 hover:bg-white/60 hover:shadow-sm hover:-translate-y-0.5'}
            `}
          >
            {active && (
              <motion.div
                layoutId="active-sidebar-tab"
                className="absolute inset-0 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 border border-blue-200/80 rounded-xl shadow-[inset_0_1px_4px_rgba(255,255,255,0.7)]"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3 w-full">
              <span className={`transition-transform duration-300 ${active ? "text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] scale-110" : "group-hover:scale-110"}`}>
                {link.icon}
              </span>
              <span className="tracking-wide">{link.name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white/50 border-r border-white/40 p-4 overflow-y-auto backdrop-blur-2xl z-30">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none -z-10" />
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
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-72 h-full bg-white/80 backdrop-blur-3xl p-5 shadow-[20px_0_40px_rgba(0,0,0,0.1)] border-r border-white/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-indigo-50/10 pointer-events-none -z-10" />
              
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.2)]">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    Zerofx.club
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-6 h-6" />
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
