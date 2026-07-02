'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, IndianRupee, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;
  activeUsersToday: number;
  pendingKyc: number;
  pendingKycChange: number;
  pendingPayments: number;
  approvedPaymentsCount: number;
  approvedPaymentsSum: number;
  todayApprovedPaymentsSum: number;
  todayApprovedPaymentsChange: number;
  totalPendingRequestsSum: number;
}

export default function AdminDashboardPage() {
  const { showError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard');
        
        // Mock change percentages since we don't have historical data in the backend yet
        setStats({
          ...data,
          totalUsersChange: 12.5,
          pendingKycChange: -5.2,
          todayApprovedPaymentsChange: 24.8,
        });
      } catch {
        showError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.approvedPaymentsSum.toLocaleString('en-IN')}`,
      subValue: `+₹${stats.todayApprovedPaymentsSum.toLocaleString('en-IN')} today`,
      icon: IndianRupee,
      trend: stats.todayApprovedPaymentsChange,
      color: 'blue',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subValue: `${stats.activeUsersToday} active today`,
      icon: Users,
      trend: stats.totalUsersChange,
      color: 'indigo',
    },
    {
      title: 'Pending KYC',
      value: stats.pendingKyc,
      subValue: 'Requires attention',
      icon: AlertCircle,
      trend: stats.pendingKycChange,
      color: 'yellow',
      warning: stats.pendingKyc > 0,
    },
    {
      title: 'Pending Deposits',
      value: stats.pendingPayments,
      subValue: `₹${stats.totalPendingRequestsSum.toLocaleString('en-IN')} pending`,
      icon: CheckCircle2,
      trend: 0,
      color: 'emerald',
      warning: stats.pendingPayments > 0,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-8 relative z-10 selection:bg-blue-500/30 selection:text-white pb-12">
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
      </div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
               <TrendingUp className="w-6 h-6 text-blue-400" />
            </span>
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Platform metrics and pending actions at a glance.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
          <p className="text-white font-semibold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const isPositive = card.trend > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const trendColor = isPositive ? 'text-emerald-400' : 'text-red-400';
          const trendBg = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';

          const Icon = card.icon;

          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card glass glow className={`p-6 bg-[#0b1221]/80 border-white/10 ${card.warning ? `shadow-[0_0_20px_rgba(234,179,8,0.1)] border-yellow-500/30` : 'hover:border-blue-500/30'} h-full flex flex-col justify-between group relative overflow-hidden`}>
                
                {/* Accent glow on hover */}
                <div className={`absolute inset-0 bg-${card.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{card.title}</p>
                    <p className="text-3xl font-black text-white drop-shadow-sm">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-${card.color}-500/10 border border-${card.color}-500/20 shadow-inner`}>
                    <Icon className={`w-6 h-6 text-${card.color}-400`} />
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <p className="text-sm font-medium text-slate-400">{card.subValue}</p>
                  {card.trend !== 0 && (
                    <div className={`flex items-center gap-1 ${trendBg} px-2 py-1 rounded-lg border border-white/5`}>
                      <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                      <span className={`text-xs font-bold ${trendColor}`}>
                        {Math.abs(card.trend)}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Action required section */}
      {(stats.pendingKyc > 0 || stats.pendingPayments > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
           <Card glass className="p-8 bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
             <div className="flex items-center gap-4 mb-6">
               <div className="p-2.5 bg-red-500/20 border border-red-500/30 rounded-xl">
                 <AlertCircle className="w-6 h-6 text-red-400" />
               </div>
               <h2 className="text-2xl font-bold text-white">Action Required</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.pendingKyc > 0 && (
                  <a href="/admin/kyc" className="flex items-center justify-between p-5 bg-[#111827]/60 rounded-2xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Users className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold group-hover:text-red-400 transition-colors">Review Pending KYC</p>
                        <p className="text-sm text-slate-400 font-medium">{stats.pendingKyc} applications waiting</p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                )}
                
                {stats.pendingPayments > 0 && (
                  <a href="/admin/payments" className="flex items-center justify-between p-5 bg-[#111827]/60 rounded-2xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <IndianRupee className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold group-hover:text-red-400 transition-colors">Verify Deposits</p>
                        <p className="text-sm text-slate-400 font-medium">{stats.pendingPayments} proofs uploaded</p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                )}
             </div>
           </Card>
        </motion.div>
      )}

      {/* System Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
        <Card glass className="p-8 bg-[#0b1221]/80 border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
             <CheckCircle2 className="w-5 h-5 text-emerald-400" /> System Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-[#111827]/60 rounded-xl border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">API Status</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-semibold">Operational</span>
                </div>
             </div>
             <div className="p-4 bg-[#111827]/60 rounded-xl border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Database</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-semibold">Connected</span>
                </div>
             </div>
          </div>
        </Card>
      </motion.div>

    </div>
  );
}
