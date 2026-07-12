'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle2, XCircle, Clock, FileText, ChevronDown, Banknote } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/api/withdrawals');
      setWithdrawals(data);
    } catch (error) {
      showError('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal? The amount will be deducted from the user balance.')) return;
    setProcessingId(id);
    try {
      await api.post(`/api/withdrawals/${id}/approve`);
      showSuccess('Withdrawal approved successfully');
      fetchWithdrawals();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    setProcessingId(rejectingId);
    try {
      await api.post(`/api/withdrawals/${rejectingId}/reject`, { reason: rejectReason });
      showSuccess('Withdrawal rejected');
      setRejectModalOpen(false);
      fetchWithdrawals();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const searchMatch =
      w.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.account.mt5Id && w.account.mt5Id.toLowerCase().includes(searchTerm.toLowerCase()));
    const statusMatch = statusFilter === 'ALL' || w.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const getStatusStyles = (status: string) => {
    if (status === 'APPROVED') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'APPROVED') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (status === 'REJECTED') return <XCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mb-1">
          <span className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
            <Banknote className="w-6 h-6 text-rose-400" />
          </span>
          Withdrawal Requests
        </h1>
        <p className="text-slate-400 text-sm font-medium ml-1">Manage and process user withdrawal requests</p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, MT5 ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto pl-11 pr-8 py-3 bg-[#111827] border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Cards List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-[#0b1221] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex justify-center p-16">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-semibold">No withdrawal requests found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredWithdrawals.map((w) => (
                <div key={w.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors">
                  {/* Row 1: User + Amount + Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold shrink-0 text-sm">
                        {w.user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{w.user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{w.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-white">₹{w.amount.toLocaleString('en-IN')}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusStyles(w.status)}`}>
                        <StatusIcon status={w.status} />
                        {w.status}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-[#111827] rounded-lg p-2.5 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Method</p>
                      <p className="text-slate-300 font-semibold">{w.method}</p>
                    </div>
                    <div className="bg-[#111827] rounded-lg p-2.5 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">MT5 Account</p>
                      <p className="text-blue-400 font-bold">{w.account.mt5Id || 'N/A'}</p>
                    </div>
                    {w.method === 'UPI Transfer' ? (
                      <div className="col-span-2 bg-[#111827] rounded-lg p-2.5 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">UPI ID</p>
                        <p className="text-emerald-400 font-bold">{w.upiId}</p>
                      </div>
                    ) : (
                      <div className="col-span-2 bg-[#111827] rounded-lg p-2.5 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Bank Account</p>
                        <p className="text-blue-400 font-bold">{w.bankAccount}</p>
                        <p className="text-slate-400 mt-0.5">IFSC: {w.ifscCode} · {w.bankName}</p>
                      </div>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {w.status === 'REJECTED' && w.rejectionReason && (
                    <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-0.5">Rejection Reason</p>
                      <p className="text-rose-300 text-xs">{w.rejectionReason}</p>
                    </div>
                  )}

                  {/* Date + Actions row */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleDateString('en-IN')} · {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {w.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(w.id)}
                          disabled={processingId === w.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(w.id)}
                          disabled={processingId === w.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060a14]/90 backdrop-blur-sm"
              onClick={() => setRejectModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-md bg-[#0b1221] border border-white/10 rounded-2xl p-5 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">Reject Withdrawal</h3>
              <p className="text-slate-400 text-sm mb-4">This will notify the user with the reason you provide.</p>
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason for Rejection *</label>
                  <textarea
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors min-h-[90px] text-sm resize-none"
                    placeholder="e.g. Invalid bank details provided"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setRejectModalOpen(false)} className="flex-1 bg-slate-800 text-white">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-0" loading={processingId === rejectingId}>
                    Confirm Reject
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
