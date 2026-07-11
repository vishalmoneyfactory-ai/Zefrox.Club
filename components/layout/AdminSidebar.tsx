'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { LayoutDashboard, Users, FileCheck, Receipt, FileBarChart, X, ShieldAlert, Banknote } from 'lucide-react';

const adminNavLinks = [
  {
    name: 'Overview',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Manage Users',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Withdrawal Requests',
    href: '/admin/withdrawals',
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    name: 'KYC Verification',
    href: '/admin/kyc',
    icon: <FileCheck className="w-5 h-5" />,
  },
  {
    name: 'Payment Proofs',
    href: '/admin/payments',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    name: 'Payment Requests',
    href: '/admin/requests',
    icon: <FileBarChart className="w-5 h-5" />,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: <FileBarChart className="w-5 h-5" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const isActive = (href: string) => pathname === href;

  const linkList = (
    <nav className="space-y-2 mt-4 relative z-10">
      {adminNavLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group
              ${active ? 'text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-slate-400 hover:text-white hover:bg-red-500/10 hover:shadow-sm hover:-translate-y-0.5'}
            `}
          >
            {active && (
              <motion.div
                layoutId="active-admin-sidebar-tab"
                className="absolute inset-0 bg-gradient-to-r from-red-600/40 to-orange-600/40 border border-red-500/50 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3 w-full">
              <span className={`transition-transform duration-300 ${active ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-red-400"}`}>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060a14]/80 backdrop-blur-md"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-72 h-full bg-[#0b1221]/90 backdrop-blur-3xl p-5 shadow-[20px_0_40px_rgba(0,0,0,0.5)] border-r border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_4px_10px_rgba(239,68,68,0.2)]">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-white">
                    Admin
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
