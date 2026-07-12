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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white">
          User <span className="text-blue-500">Management</span>
        </h1>
        <p className="text-slate-400 mt-2">Select a user to manage their accounts</p>
      </div>

      {/* Stats and Search Card */}
      <div className="bg-[#0b1221] border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#111827] rounded-2xl p-2 border border-white/5">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-500 absolute left-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 font-medium"
            />
          </div>
          <div className="flex items-center px-4 py-3 bg-[#060a14] rounded-xl border border-white/10 gap-2 cursor-pointer w-full md:w-auto">
            <span className="text-slate-300 font-semibold text-sm">All Users</span>
            <Filter className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] rounded-2xl p-6 text-center border border-white/5">
            <h3 className="text-3xl font-black text-white mb-1">{users.length}</h3>
            <p className="text-slate-500 text-sm font-semibold">Total Users</p>
          </div>
          <div className="bg-[#111827] rounded-2xl p-6 text-center border border-white/5">
            <h3 className="text-3xl font-black text-emerald-400 mb-1">{pendingDeposits}</h3>
            <p className="text-slate-500 text-sm font-semibold">Pending Deposits</p>
          </div>
          <div className="bg-[#111827] rounded-2xl p-6 text-center border border-white/5">
            <h3 className="text-3xl font-black text-purple-400 mb-1">{pendingWithdrawals}</h3>
            <p className="text-slate-500 text-sm font-semibold">Pending Withdrawals</p>
          </div>
          <div className="bg-[#111827] rounded-2xl p-6 text-center border border-white/5">
            <h3 className="text-3xl font-black text-orange-400 mb-1">{pendingDeposits + pendingWithdrawals}</h3>
            <p className="text-slate-500 text-sm font-semibold">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[#0b1221] border border-white/10 rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 px-2">Users List</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const liveAccounts = user.tradingAccounts?.filter(a => a.type === 'LIVE') || [];
              const totalBalance = liveAccounts.reduce((sum, acc) => sum + acc.balance, 0);
              const primaryPlan = liveAccounts.length > 0 ? liveAccounts[0].plan : 'None';

              return (
                <div key={user.id} className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  {/* User Info */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">User Information</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{user.fullName}</h4>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Account Details</p>
                    <p className="text-white font-bold">{user.tradingAccounts?.length || 0} Accounts</p>
                    <p className="text-sm text-slate-400">Primary: {primaryPlan}</p>
                  </div>

                  {/* Status & Balance */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Status & Balance</p>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-white font-bold">Active</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  {/* Last Login & Action */}
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Last Login</p>
                      <p className="text-sm text-slate-300 font-medium">{new Date(user.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                    <Link href={`/admin/users/${user.id}`}>
                      <button className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-indigo-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105">
                        Manage <ArrowRight className="w-4 h-4" />
                        {((user._count?.payments ?? 0) + (user._count?.withdrawals ?? 0)) > 0 && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[11px] font-black border-2 border-white shadow-md animate-pulse">
                            {(user._count?.payments ?? 0) + (user._count?.withdrawals ?? 0)}
                          </span>
                        )}
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
