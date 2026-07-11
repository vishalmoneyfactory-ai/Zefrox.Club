'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Mail, Phone, Calendar, ArrowLeft, Save, Edit, Trash2, Banknote, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  kyc?: { id: string; status: string };
  tradingAccounts: TradingAccount[];
  withdrawals?: any[];
}

interface TradingAccount {
  id: string;
  type: string;
  plan: string;
  balance: number;
  mt5Id: string;
  mt5Password: string;
  server: string;
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { showSuccess, showError } = useToast();
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Edit states for Trading Accounts
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TradingAccount>>({});
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/api/users/${id}`);
      setUser(data);
    } catch (error) {
      showError('Failed to load user details');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user and all their accounts? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await api.delete(`/api/users/${id}`);
      showSuccess('User deleted successfully');
      router.push('/admin/users');
    } catch (error) {
      showError('Failed to delete user');
      setDeleting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this trading account? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/api/accounts/${accountId}`);
      showSuccess('Trading account deleted successfully');
      fetchUser();
    } catch (error) {
      showError('Failed to delete trading account');
    }
  };

  const startEditing = (account: TradingAccount) => {
    setEditingAccountId(account.id);
    setEditFormData({
      balance: account.balance,
      mt5Id: account.mt5Id,
      mt5Password: account.mt5Password,
      server: account.server
    });
  };

  const saveAccountEdit = async () => {
    if (!editingAccountId) return;
    setSavingAccount(true);
    try {
      await api.patch(`/api/accounts/${editingAccountId}`, editFormData);
      showSuccess('Account updated successfully');
      setEditingAccountId(null);
      fetchUser();
    } catch (error) {
      showError('Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/users')}
            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-white">User <span className="text-blue-500">Details</span></h1>
        </div>
        <Button variant="danger" onClick={handleDelete} loading={deleting}>
          Delete User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-[#0b1221] border border-white/10 rounded-3xl p-6 lg:col-span-1 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {user.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full mt-2 text-sm font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              {user.kyc?.status || 'UNVERIFIED'}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Email Address</p>
                <p className="text-slate-300 font-medium truncate">{user.email}</p>
              </div>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Phone Number</p>
                <p className="text-slate-300 font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Joined Date</p>
                <p className="text-slate-300 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Accounts Card */}
        <div className="bg-[#0b1221] border border-white/10 rounded-3xl p-6 lg:col-span-2 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Trading Accounts
          </h3>

          <div className="space-y-4">
            {user.tradingAccounts.length === 0 ? (
              <div className="text-center py-12 bg-[#111827] rounded-2xl border border-dashed border-white/10">
                <p className="text-slate-400">No trading accounts found for this user.</p>
              </div>
            ) : (
              user.tradingAccounts.map(account => (
                <div key={account.id} className="bg-[#111827] rounded-2xl p-5 border border-white/5 relative group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {editingAccountId === account.id ? (
                      <button onClick={saveAccountEdit} disabled={savingAccount} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => startEditing(account)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors opacity-0 group-hover:opacity-100">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAccount(account.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-white text-slate-800 font-bold rounded-lg text-sm">
                      {account.plan}
                    </div>
                    <div className={`px-2 py-1 font-bold rounded text-xs ${account.type === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-300'}`}>
                      {account.type}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Balance</label>
                      {editingAccountId === account.id ? (
                        <input
                          type="number"
                          value={editFormData.balance}
                          onChange={e => setEditFormData({...editFormData, balance: Number(e.target.value)})}
                          className="w-full bg-[#060a14] border border-white/10 rounded-lg px-3 py-2 text-white text-lg font-bold focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-2xl font-black text-emerald-400 tracking-tight">₹{account.balance.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">MT5 ID</label>
                      {editingAccountId === account.id ? (
                        <input
                          type="text"
                          value={editFormData.mt5Id}
                          onChange={e => setEditFormData({...editFormData, mt5Id: e.target.value})}
                          className="w-full bg-[#060a14] border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-lg font-bold text-slate-200">{account.mt5Id}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">MT5 Password</label>
                      {editingAccountId === account.id ? (
                        <input
                          type="text"
                          value={editFormData.mt5Password}
                          onChange={e => setEditFormData({...editFormData, mt5Password: e.target.value})}
                          className="w-full bg-[#060a14] border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-300 font-mono tracking-wider">{account.mt5Password}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Server</label>
                      {editingAccountId === account.id ? (
                        <input
                          type="text"
                          value={editFormData.server}
                          onChange={e => setEditFormData({...editFormData, server: e.target.value})}
                          className="w-full bg-[#060a14] border border-white/10 rounded-lg px-3 py-2 text-white font-medium focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-300">{account.server}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Withdrawals Section */}
      <div className="bg-[#0b1221] border border-white/10 rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-red-400" />
          Withdrawal Requests
        </h3>

        <div className="space-y-4">
          {!user.withdrawals || user.withdrawals.length === 0 ? (
            <div className="text-center py-12 bg-[#111827] rounded-2xl border border-dashed border-white/10">
              <p className="text-slate-400">No withdrawal requests found for this user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 text-sm font-semibold text-slate-400">Account</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Amount / Method</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Details</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {user.withdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-bold border border-blue-500/20">
                          {user.tradingAccounts.find(a => a.id === w.accountId)?.mt5Id || 'Unknown MT5'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-lg font-black text-white">₹{w.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 font-semibold">{w.method}</p>
                      </td>
                      <td className="p-4">
                        {w.method === 'UPI Transfer' ? (
                          <div className="bg-[#0b1221] p-3 rounded-lg border border-white/5 inline-block">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">UPI ID</p>
                            <p className="text-sm text-emerald-400 font-bold">{w.upiId}</p>
                          </div>
                        ) : (
                          <div className="bg-[#0b1221] p-3 rounded-lg border border-white/5 inline-block">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Account Number</p>
                            <p className="text-sm text-blue-400 font-bold mb-1">{w.bankAccount}</p>
                            <p className="text-xs text-white">IFSC: {w.ifscCode}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          w.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {w.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                           w.status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : 
                           <Clock className="w-3.5 h-3.5" />}
                          {w.status}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-300 font-medium">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
