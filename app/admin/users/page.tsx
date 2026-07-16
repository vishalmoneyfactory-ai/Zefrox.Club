'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Filter, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  totalPaid: number;
  createdAt: string;
  kyc?: { id: string; status: string };
  tradingAccounts: { id: string; type: string; plan: string; balance: number }[];
  _count?: {
    payments: number;
    withdrawals: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const { showError } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (error) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [paymentsRes, withdrawalsRes] = await Promise.all([
        api.get('/api/payments?status=PROOF_UPLOADED'),
        api.get('/api/withdrawals')
      ]);
      setPendingDeposits(paymentsRes.data.length);
      setPendingWithdrawals(withdrawalsRes.data.filter((w: any) => w.status === 'PENDING').length);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          User <span className="text-indigo-600">Management</span>
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">Select a user to manage their accounts</p>
      </div>

      {/* Stats and Search Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 rounded-xl p-2 border border-slate-200">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-xl transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="flex items-center px-4 py-3 bg-white border border-slate-200 rounded-xl gap-2 cursor-pointer w-full md:w-auto shadow-sm">
            <span className="text-slate-600 font-semibold text-sm">All Users</span>
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-3xl font-black text-slate-800 mb-1">{users.length}</h3>
            <p className="text-slate-500 text-sm font-semibold">Total Users</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-3xl font-black text-emerald-600 mb-1">{pendingDeposits}</h3>
            <p className="text-slate-500 text-sm font-semibold">Pending Deposits</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-3xl font-black text-violet-600 mb-1">{pendingWithdrawals}</h3>
            <p className="text-slate-500 text-sm font-semibold">Pending Withdrawals</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <h3 className="text-3xl font-black text-amber-600 mb-1">{pendingDeposits + pendingWithdrawals}</h3>
            <p className="text-slate-500 text-sm font-semibold">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Users List</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const liveAccounts = user.tradingAccounts?.filter(a => a.type === 'LIVE') || [];
              const totalBalance = liveAccounts.reduce((sum, acc) => sum + acc.balance, 0);
              const primaryPlan = liveAccounts.length > 0 ? liveAccounts[0].plan : 'None';

              return (
                <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 hover:bg-indigo-50/30 transition-colors shadow-sm">
                  {/* Top row: avatar + name + manage button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-slate-800 font-bold truncate">{user.fullName}</h4>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href={`/admin/users/${user.id}`} className="shrink-0">
                      <button className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-indigo-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm">
                        Manage <ArrowRight className="w-4 h-4" />
                        {((user._count?.payments ?? 0) + (user._count?.withdrawals ?? 0)) > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md animate-pulse">
                            {(user._count?.payments ?? 0) + (user._count?.withdrawals ?? 0)}
                          </span>
                        )}
                      </button>
                    </Link>
                  </div>

                  {/* Bottom row: account + balance + status */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Accounts</p>
                      <p className="text-slate-800 font-bold text-sm">{user.tradingAccounts?.length || 0}</p>
                      <p className="text-xs text-slate-400">{primaryPlan}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Balance</p>
                      <p className="text-sm font-bold text-emerald-600">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Joined</p>
                      <p className="text-xs text-slate-600 font-medium">{new Date(user.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-10 text-center text-slate-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
