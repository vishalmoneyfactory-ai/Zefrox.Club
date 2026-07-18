'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Mail, Phone, Calendar, ArrowLeft, Save, Edit, Trash2, Banknote, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
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
  payments?: any[];
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
    setEditFormData({ balance: account.balance, mt5Id: account.mt5Id, mt5Password: account.mt5Password, server: account.server });
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

  const kycBadgeColor = user.kyc?.status === 'APPROVED'
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : user.kyc?.status === 'REJECTED'
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/admin/users')}
            className="shrink-0 p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600 border border-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 truncate">
              {user.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
          </div>
        </div>
        <Button variant="danger" onClick={handleDelete} loading={deleting} className="shrink-0 text-sm px-3 py-2">
          Delete
        </Button>
      </motion.div>

      {/* Profile + Stats Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Avatar + KYC card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 sm:flex-col sm:items-center sm:text-center shadow-lg">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-slate-800 text-2xl sm:text-3xl font-black shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0 sm:w-full">
            <h2 className="font-bold text-slate-800 truncate sm:text-center mb-1">{user.fullName}</h2>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${kycBadgeColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {user.kyc?.status || 'UNVERIFIED'}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
            <p className="text-slate-700 font-semibold text-sm truncate">{user.email}</p>
          </div>
        </div>

        {/* Phone + Joined */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/20">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Phone</p>
            <p className="text-slate-700 font-semibold">{user.phone}</p>
            <p className="text-[10px] text-slate-600 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Trading Accounts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Trading Accounts
            <span className="ml-auto text-xs text-slate-500 font-medium">{user.tradingAccounts.length} account{user.tradingAccounts.length !== 1 ? 's' : ''}</span>
          </h3>

          {user.tradingAccounts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No trading accounts found for this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.tradingAccounts.map(account => (
                <div key={account.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {/* Account header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white text-slate-900 font-bold rounded-lg text-sm">{account.plan}</span>
                      <span className={`px-2 py-0.5 font-bold rounded text-xs border ${account.type === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-slate-700 text-slate-600 border-slate-600'}`}>
                        {account.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {editingAccountId === account.id ? (
                        <button onClick={saveAccountEdit} disabled={savingAccount} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors border border-emerald-500/20">
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => startEditing(account)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/20">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteAccount(account.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Balance highlighted */}
                  <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Balance</p>
                    {editingAccountId === account.id ? (
                      <input
                        type="number"
                        value={editFormData.balance}
                        onChange={e => setEditFormData({ ...editFormData, balance: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-lg font-bold focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-2xl font-black text-emerald-400">₹{account.balance.toLocaleString('en-IN')}</p>
                    )}
                  </div>

                  {/* Other fields grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'MT5 ID', key: 'mt5Id', value: account.mt5Id },
                      { label: 'MT5 Password', key: 'mt5Password', value: account.mt5Password },
                      { label: 'Server', key: 'server', value: account.server },
                    ].map(field => (
                      <div key={field.key} className="bg-white rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{field.label}</p>
                        {editingAccountId === account.id ? (
                          <input
                            type="text"
                            value={(editFormData as any)[field.key] ?? ''}
                            onChange={e => setEditFormData({ ...editFormData, [field.key]: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-sm font-medium focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-slate-700 font-mono text-sm truncate">{field.value || '—'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Withdrawals Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-red-400" />
            Withdrawal Requests
          </h3>

          {!user.withdrawals || user.withdrawals.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No withdrawal requests found for this user.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.withdrawals.map((w: any) => {
                const statusColor = w.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : w.status === 'REJECTED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                const StatusIcon = w.status === 'APPROVED' ? CheckCircle2 : w.status === 'REJECTED' ? XCircle : Clock;

                return (
                  <div key={w.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-lg font-black text-slate-800">₹{w.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-400 font-semibold">{w.method}</p>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor} shrink-0`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {w.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">MT5 Account</p>
                        <p className="text-blue-400 font-bold text-xs">{user.tradingAccounts.find(a => a.id === w.accountId)?.mt5Id || 'Unknown'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Date & Time</p>
                        <p className="text-slate-600 font-medium text-xs">{new Date(w.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      {w.method === 'UPI Transfer' ? (
                        <div className="col-span-2 bg-white rounded-lg p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">UPI ID</p>
                          <p className="text-emerald-400 font-bold text-sm">{w.upiId}</p>
                        </div>
                      ) : (
                        <div className="col-span-2 bg-white rounded-lg p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Bank Details</p>
                          <p className="text-blue-400 font-bold text-sm">{w.bankAccount}</p>
                          <p className="text-xs text-slate-400">IFSC: {w.ifscCode}</p>
                        </div>
                      )}
                    </div>

                    {w.rejectionReason && (
                      <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">Rejection Reason</p>
                        <p className="text-rose-300 text-sm">{w.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
      {/* Deposit History Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg mt-5">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Deposit History
          </h3>

          {!user.payments || user.payments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No deposit history found for this user.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.payments.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((p: any) => {
                const statusColor = p.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : p.status === 'REJECTED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                const StatusIcon = p.status === 'APPROVED' ? CheckCircle2 : p.status === 'REJECTED' ? XCircle : Clock;

                return (
                  <div key={p.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <p className="text-lg font-black text-slate-800">₹{p.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{p.upiApp ? `UPI (${p.upiApp})` : 'Manual Deposit'}</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor} w-max`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {p.status}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {new Date(p.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
