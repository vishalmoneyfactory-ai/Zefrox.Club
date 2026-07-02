'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldAlert, CreditCard, DollarSign, Wallet, Activity, Search, PlusCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import StatsCard from '@/components/features/StatsCard';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DashboardData {
  totalUsers: number;
  totalRegularUsers: number;
  pendingKyc: number;
  pendingPayments: number;
  approvedPayments: number;
  todayApprovedAmount: number;
  totalApprovedAmount: number;
  pendingRequestsAmount: number;
  paidTodayUsers: { id: string; fullName: string; totalPaid: number }[];
  notPaidTodayUsers: { id: string; fullName: string }[];
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment request form
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: dashData } = await api.get('/api/admin/dashboard');
      setData(dashData);
    } catch {
      showError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const searchUsers = useCallback(async (search: string) => {
    try {
      const { data: usersData } = await api.get(`/api/users?search=${encodeURIComponent(search)}`);
      setUsers(usersData.filter((u: UserOption & { role: string }) => u.role !== 'ADMIN'));
    } catch {
      // Ignore search errors
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (userSearch.length >= 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(userSearch);
        setShowDropdown(true);
      }, 300);
    } else {
      setUsers([]);
      setShowDropdown(false);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [userSearch, searchUsers]);

  const handleCreateRequest = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      showError('Select a user and enter a valid amount');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/payments/request', {
        userId: selectedUser.id,
        amount: parseFloat(amount),
      });
      showSuccess(`Payment request of ₹${parseFloat(amount).toLocaleString('en-IN')} sent to ${selectedUser.fullName}`);
      setSelectedUser(null);
      setUserSearch('');
      setAmount('');
      fetchDashboard();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  if (!data) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="relative z-10 space-y-8 animate-fade-in pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" /> Command Center
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Overview of platform activity and management</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard title="Total Users" value={data.totalRegularUsers} color="blue" icon={<Users className="w-6 h-6" />} onClick={() => router.push('/admin/users')} />
          <StatsCard title="Pending KYC" value={data.pendingKyc} color="yellow" icon={<ShieldAlert className="w-6 h-6" />} onClick={() => router.push('/admin/kyc')} />
          <StatsCard title="Pending Proofs" value={data.pendingPayments} color="red" icon={<CreditCard className="w-6 h-6" />} onClick={() => router.push('/admin/payments')} />
          <StatsCard title="Today's Flow" value={`₹${data.todayApprovedAmount.toLocaleString('en-IN')}`} color="green" icon={<DollarSign className="w-6 h-6" />} />
          <StatsCard title="Total Flow" value={`₹${data.totalApprovedAmount.toLocaleString('en-IN')}`} color="purple" icon={<Wallet className="w-6 h-6" />} />
          <StatsCard title="Pending Amt" value={`₹${data.pendingRequestsAmount.toLocaleString('en-IN')}`} color="yellow" icon={<Activity className="w-6 h-6" />} />
        </motion.div>

        {/* Create Payment Request - ADDED relative z-50 HERE TO FIX DROPDOWN ISSUE */}
        <motion.div variants={itemVariants} className="relative z-50">
          <Card glass glow className="p-6 border-white/5 bg-[#0b1221]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl relative">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-400" /> Create Payment Request
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full relative">
                <label htmlFor="admin-user-search" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select User</label>
                {selectedUser ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl w-full shadow-inner">
                    <span className="text-sm font-bold text-white">{selectedUser.fullName}</span>
                    <span className="text-xs text-blue-400/80">({selectedUser.email})</span>
                    <button
                      onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                      className="ml-auto text-blue-400 hover:text-white transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="admin-user-search"
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-[#060a14]/60 rounded-xl border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm shadow-inner"
                      onFocus={() => userSearch.length >= 1 && setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showDropdown && users.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[100] mt-2 w-full bg-[#111827] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDropdown(false);
                                setUserSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 text-sm flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 last:border-0 transition-colors"
                            >
                              <span className="font-bold text-white">{u.fullName}</span>
                              <span className="text-xs text-slate-400 mt-1 sm:mt-0">{u.email}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="admin-amount" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                <input
                  id="admin-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  className="w-full px-4 py-3 bg-[#060a14]/60 rounded-xl border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm shadow-inner"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleCreateRequest}
                  disabled={creating || !selectedUser || !amount}
                  loading={creating}
                  className="w-full sm:w-auto py-3 px-8 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  Send Request
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Paid Today / Not Paid Today */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <Card glass className="p-6 border-white/5 bg-[#0b1221]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              Paid Today
              <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-3 py-1 font-bold rounded-lg border border-green-500/30 shadow-inner">
                {data.paidTodayUsers.length} Users
              </span>
            </h3>
            {data.paidTodayUsers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-[#060a14]/60">
                <p className="text-slate-400 text-sm font-medium">No payments collected today.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {data.paidTodayUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-[#060a14]/60 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors shadow-sm">
                    <span className="text-sm font-bold text-white">{u.fullName}</span>
                    <span className="text-sm font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20 shadow-inner">₹{u.totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card glass className="p-6 border-white/5 bg-[#0b1221]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              Not Paid Today
              <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-3 py-1 font-bold rounded-lg border border-red-500/30 shadow-inner">
                {data.notPaidTodayUsers.length} Users
              </span>
            </h3>
            {data.notPaidTodayUsers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-[#060a14]/60">
                <p className="text-slate-400 text-sm font-medium">Everyone is up to date!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {data.notPaidTodayUsers.map((u) => (
                  <div key={u.id} className="flex items-center px-4 py-3 bg-[#060a14]/60 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors shadow-sm">
                    <span className="text-sm font-bold text-slate-300">{u.fullName}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
