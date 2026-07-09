'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, CheckCircle2, XCircle, Plus, IndianRupee, Image as ImageIcon, CreditCard } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';

interface Payment {
  id: string;
  amount: number;
  status: 'PROOF_UPLOADED' | 'APPROVED' | 'REJECTED';
  screenshotUrl: string;
  transactionId: string;
  submittedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    totalPaid: number;
  };
  tradingAccount?: {
    plan: string;
    mt5Id: string;
  };
}

export default function AdminPaymentsPage() {
  const { showSuccess, showError } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewModal, setViewModal] = useState<{ open: boolean; payment: Payment | null }>({ open: false, payment: null });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectReason, setRejectReason] = useState('');
  
  const [requestModal, setRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ userEmail: '', amount: '' });
  
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/payments/pending-verification');
      setPayments(data);
    } catch {
      showError('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await api.post(`/api/payments/${id}/approve`);
      setPayments(payments.filter((p) => p.id !== id));
      showSuccess('Payment Approved Successfully');
      setViewModal({ open: false, payment: null });
    } catch {
      showError('Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError('Rejection reason is required');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/payments/${rejectModal.id}/reject`, { reason: rejectReason });
      setPayments(payments.filter((p) => p.id !== rejectModal.id));
      showSuccess('Payment Rejected');
      setRejectModal({ open: false, id: '' });
      setRejectReason('');
      setViewModal({ open: false, payment: null });
    } catch {
      showError('Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.userEmail || !requestForm.amount) {
      showError('Please fill all fields');
      return;
    }
    setActionLoading(true);
    try {
      // First find user by email
      const { data: users } = await api.get(`/api/users?search=${requestForm.userEmail}`);
      const user = users.find((u: any) => u.email === requestForm.userEmail);
      if (!user) {
        showError('User not found with this email');
        return;
      }
      
      // Create request
      await api.post('/api/payments/request', {
        userId: user.id,
        amount: Number(requestForm.amount)
      });
      
      showSuccess('Payment request created and user notified');
      setRequestModal(false);
      setRequestForm({ userEmail: '', amount: '' });
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10 selection:bg-blue-500/30 selection:text-white pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/3 translate-x-1/3" />
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
               <CreditCard className="w-6 h-6 text-emerald-400" />
            </span>
            Payment Approvals
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Verify deposited funds and manage user balances.</p>
        </div>
        
        <Button onClick={() => setRequestModal(true)} variant="primary" className="shadow-[0_0_20px_rgba(37,99,235,0.4)] px-6 py-2.5">
          <Plus className="w-5 h-5 mr-2" /> New Payment Request
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card glass className="p-0 overflow-hidden bg-[#0b1221]/80 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner size="lg" className="text-blue-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-20 text-center">
               <div className="w-20 h-20 mx-auto bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <CheckCircle2 className="w-10 h-10 text-emerald-500" />
               </div>
               <p className="text-white font-bold text-lg mb-2">No pending payments</p>
               <p className="text-slate-400 font-medium">All deposits have been verified!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#111827]/60 backdrop-blur-md">
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-0.5">{payment.user.fullName}</div>
                        <div className="text-xs text-slate-500 font-medium">{payment.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-black text-emerald-400">
                           ₹{payment.amount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                           {payment.transactionId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {new Date(payment.submittedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewModal({ open: true, payment })}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Verify <Eye className="w-4 h-4 ml-2 inline" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Review Modal */}
      <Modal 
        isOpen={viewModal.open} 
        onClose={() => !actionLoading && setViewModal({ open: false, payment: null })}
        title="Verify Payment"
        size="lg"
      >
        {viewModal.payment && (
          <div className="space-y-8">
             
             <div className="flex justify-between items-start pb-6 border-b border-white/10">
               <div>
                  <h3 className="text-2xl font-black text-emerald-400 mb-1">₹{viewModal.payment.amount.toLocaleString('en-IN')}</h3>
                  <p className="text-slate-400 font-medium">Deposit Amount</p>
               </div>
               <Badge variant="proof-uploaded">Awaiting Verification</Badge>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Proof Image */}
                <div className="space-y-4">
                   <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Payment Screenshot</p>
                   <a href={viewModal.payment.screenshotUrl} target="_blank" rel="noreferrer" className="block relative group rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                     <img src={viewModal.payment.screenshotUrl} alt="Proof" className="w-full h-auto object-contain bg-slate-900 max-h-[300px]" />
                     <div className="absolute inset-0 bg-[#060a14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Eye className="w-10 h-10 text-white" />
                     </div>
                   </a>
                </div>

                {/* Details */}
                <div className="space-y-6">
                   <div className="bg-[#111827]/40 rounded-2xl p-6 border border-white/5 space-y-5">
                      <h4 className="text-sm font-bold text-white mb-2 border-b border-white/5 pb-2">User Details</h4>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Name</p>
                         <p className="text-white font-medium">{viewModal.payment.user.fullName}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p>
                         <p className="text-white font-medium">{viewModal.payment.user.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Current Balance</p>
                         <p className="text-emerald-400 font-bold">₹{viewModal.payment.user.totalPaid.toLocaleString('en-IN')}</p>
                      </div>
                   </div>

                   {viewModal.payment.tradingAccount && (
                     <div className="bg-[#111827]/40 rounded-2xl p-6 border border-white/5 space-y-5 mt-6">
                        <h4 className="text-sm font-bold text-white mb-2 border-b border-white/5 pb-2">Account Details</h4>
                        <div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Plan</p>
                           <p className="text-white font-medium">{viewModal.payment.tradingAccount.plan}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">MT5 ID</p>
                           <p className="text-white font-mono font-bold">{viewModal.payment.tradingAccount.mt5Id}</p>
                        </div>
                     </div>
                   )}

                   <div className="bg-[#111827]/40 rounded-2xl p-6 border border-white/5 space-y-5">
                      <h4 className="text-sm font-bold text-white mb-2 border-b border-white/5 pb-2">Transaction Details</h4>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
                         <p className="text-white font-mono font-bold">{viewModal.payment.transactionId}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Submitted On</p>
                         <p className="text-white font-medium">{new Date(viewModal.payment.submittedAt).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Actions */}
             <div className="pt-6 border-t border-white/10 flex gap-4">
               <Button
                 variant="danger"
                 className="flex-1 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                 onClick={() => setRejectModal({ open: true, id: viewModal.payment!.id })}
                 disabled={actionLoading}
               >
                 <XCircle className="w-5 h-5 mr-2" /> Reject Proof
               </Button>
               <Button
                 variant="primary"
                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                 onClick={() => handleApprove(viewModal.payment!.id)}
                 loading={actionLoading}
               >
                 <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & Credit
               </Button>
             </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => !actionLoading && setRejectModal({ open: false, id: '' })}
        title="Reject Payment"
        size="sm"
      >
        <div className="space-y-6">
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-300">Reason for Rejection *</label>
             <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Fake screenshot, unmatched transaction ID..."
                className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 min-h-[120px] resize-none"
             />
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setRejectModal({ open: false, id: '' })} className="flex-1 bg-slate-800 text-white" disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">Confirm Reject</Button>
           </div>
        </div>
      </Modal>

      {/* Create Request Modal */}
      <Modal
        isOpen={requestModal}
        onClose={() => !actionLoading && setRequestModal(false)}
        title="Create Payment Request"
        size="sm"
      >
        <form onSubmit={handleCreateRequest} className="space-y-6">
          <p className="text-sm text-slate-400 mb-4 font-medium">
            Send a deposit request to a user. They will receive a notification and can upload proof from their dashboard.
          </p>
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-300">User Email *</label>
               <input
                  type="email"
                  value={requestForm.userEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, userEmail: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  required
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-300">Amount (₹) *</label>
               <input
                  type="number"
                  min="1"
                  value={requestForm.amount}
                  onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
                  required
               />
             </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/10">
             <Button type="button" variant="ghost" onClick={() => setRequestModal(false)} className="flex-1 bg-slate-800 text-white" disabled={actionLoading}>Cancel</Button>
             <Button type="submit" variant="primary" loading={actionLoading} className="flex-1 shadow-[0_0_20px_rgba(37,99,235,0.4)]">Send Request</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
