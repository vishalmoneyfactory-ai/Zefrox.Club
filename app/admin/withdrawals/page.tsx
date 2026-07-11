'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle2, XCircle, Clock, FileText, ChevronDown } from 'lucide-react';
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

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Withdrawal Requests</h1>
        <p className="text-slate-400">Manage user withdrawal requests</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or MT5 ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-12 pr-10 py-3 bg-[#111827] border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[180px]"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-semibold text-slate-400">User / Account</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Amount / Method</th>
                <th className="p-4 text-sm font-semibold text-slate-400 min-w-[250px]">Payment Details</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-semibold">No withdrawal requests found.</p>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-white">{w.user.fullName}</p>
                      <p className="text-xs text-slate-400 mb-1">{w.user.email}</p>
                      <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold border border-blue-500/20">
                        {w.account.type} - {w.account.mt5Id || 'No MT5 ID'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-lg font-black text-white">₹{w.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 font-semibold">{w.method}</p>
                    </td>
                    <td className="p-4">
                      {w.method === 'UPI Transfer' ? (
                        <div className="bg-[#0b1221] p-3 rounded-lg border border-white/5">
                          <p className="text-xs text-slate-500 font-medium mb-1">UPI ID</p>
                          <p className="text-sm text-emerald-400 font-bold">{w.upiId}</p>
                        </div>
                      ) : (
                        <div className="bg-[#0b1221] p-3 rounded-lg border border-white/5 space-y-2">
                          <div>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Account Number</p>
                            <p className="text-sm text-blue-400 font-bold">{w.bankAccount}</p>
                          </div>
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Bank</p>
                              <p className="text-xs text-white font-medium">{w.bankName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">IFSC</p>
                              <p className="text-xs text-white font-medium">{w.ifscCode}</p>
                            </div>
                          </div>
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
                      {w.status === 'REJECTED' && w.rejectionReason && (
                        <p className="text-[10px] text-rose-400 mt-2 max-w-[150px] truncate" title={w.rejectionReason}>
                          {w.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300 font-medium">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      {w.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleApprove(w.id)}
                            disabled={processingId === w.id}
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Approve Request"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openRejectModal(w.id)}
                            disabled={processingId === w.id}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Reject Request"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060a14]/90 backdrop-blur-sm"
              onClick={() => setRejectModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0b1221] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Reject Withdrawal</h3>
              <form onSubmit={handleRejectSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Reason for rejection</label>
                  <textarea
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors min-h-[100px]"
                    placeholder="e.g. Invalid bank details provided"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setRejectModalOpen(false)} className="flex-1">
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
