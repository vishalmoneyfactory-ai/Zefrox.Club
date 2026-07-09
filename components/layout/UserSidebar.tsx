'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { LayoutDashboard, History, ShieldCheck, User, X, Zap } from 'lucide-react';

const navLinks = [
  {
    name: 'Accounts',
    href: '/accounts',
    icon: <LayoutDashboard className="w-5 h-5" />,
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
              ${active ? 'text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-slate-400 hover:text-white hover:bg-blue-500/10 hover:shadow-sm hover:-translate-y-0.5'}
            `}
          >
            {active && (
              <motion.div
                layoutId="active-sidebar-tab"
                className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 border border-blue-500/50 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3 w-full">
              <span className={`transition-transform duration-300 ${active ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-blue-400"}`}>
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
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-[#0b1221]/80 border-r border-white/5 p-4 overflow-y-auto backdrop-blur-2xl z-30">
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
              className="absolute inset-0 bg-[#060a14]/80 backdrop-blur-md"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-72 h-full bg-[#0b1221]/90 backdrop-blur-3xl p-5 shadow-[20px_0_40px_rgba(0,0,0,0.5)] border-r border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    Zerofx.club
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
