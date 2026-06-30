'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, ShieldCheck, CreditCard, Clock, FileText, X } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { name: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" />, exact: false },
  { name: 'KYC Verification', href: '/admin/kyc', icon: <ShieldCheck className="w-5 h-5" />, exact: false },
  { name: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-5 h-5" />, exact: false },
  { name: 'Payment Requests', href: '/admin/requests', icon: <Clock className="w-5 h-5" />, exact: false },
  { name: 'Reports', href: '/admin/reports', icon: <FileText className="w-5 h-5" />, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const linkList = (
    <nav className="space-y-2 mt-4">
      {navLinks.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group
              ${active ? 'text-white' : 'text-slate-400 hover:text-white'}
            `}
          >
            {active && (
              <motion.div
                layoutId="admin-sidebar-active"
                className="absolute inset-0 bg-aurora-purple/20 border border-aurora-purple/50 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {!active && (
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            )}
            <div className={`relative z-10 ${active ? 'text-aurora-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`}>
              {link.icon}
            </div>
            <span className="relative z-10 tracking-wide">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-[#030712]/80 backdrop-blur-xl border-r border-white/5 p-4 overflow-y-auto z-30">
        <div className="text-xs uppercase tracking-widest text-slate-600 font-black mb-2 px-4">Admin Controls</div>
        {linkList}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 h-full bg-[#030712] border-r border-white/10 p-4 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                    Zerofx.club
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-600 font-black mb-2 px-4">Admin Controls</div>
              <div className="flex-1 overflow-y-auto">
                {linkList}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
