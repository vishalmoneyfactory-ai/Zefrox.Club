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
        <Spinner size="lg" className="text-indigo-500" />
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
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </span>
            Command Center
          </h1>
          <p className="text-slate-600 mt-2 font-medium">Overview of platform activity and management</p>
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

        {/* Create Payment Request */}
        <motion.div variants={itemVariants} className="relative z-50">
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 relative">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                <PlusCircle className="w-4 h-4" />
              </span>
              Create Payment Request
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full relative">
                <label htmlFor="admin-user-search" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select User</label>
                {selectedUser ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-100 border border-indigo-200 rounded-xl w-full">
                    <span className="text-sm font-bold text-indigo-700">{selectedUser.fullName}</span>
                    <span className="text-xs text-indigo-500">({selectedUser.email})</span>
                    <button
                      onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                      className="ml-auto text-indigo-400 hover:text-indigo-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="admin-user-search"
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-xl transition-all text-sm outline-none"
                      onFocus={() => userSearch.length >= 1 && setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showDropdown && users.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[100] mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDropdown(false);
                                setUserSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-indigo-50 text-sm flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                            >
                              <span className="font-bold text-slate-700">{u.fullName}</span>
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
                <label htmlFor="admin-amount" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount (₹)</label>
                <input
                  id="admin-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-xl transition-all text-sm outline-none"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleCreateRequest}
                  disabled={creating || !selectedUser || !amount}
                  loading={creating}
                  className="w-full sm:w-auto py-3 px-8"
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Paid Today / Not Paid Today */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Paid Today */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              Paid Today
              <span className="ml-auto bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 font-bold rounded-lg">
                {data.paidTodayUsers.length} Users
              </span>
            </h3>
            {data.paidTodayUsers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-400 text-sm font-medium">No payments collected today.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {data.paidTodayUsers.map((u) => (
                  <div key={u.id} className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{u.fullName}</span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">₹{u.totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Not Paid Today */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white">
                <XCircle className="w-4 h-4" />
              </div>
              Not Paid Today
              <span className="ml-auto bg-red-100 text-red-700 border border-red-200 text-xs px-3 py-1 font-bold rounded-lg">
                {data.notPaidTodayUsers.length} Users
              </span>
            </h3>
            {data.notPaidTodayUsers.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-400 text-sm font-medium">Everyone is up to date!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {data.notPaidTodayUsers.map((u) => (
                  <div key={u.id} className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-slate-700">{u.fullName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
