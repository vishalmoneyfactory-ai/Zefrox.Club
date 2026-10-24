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
  account?: {
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
    <div className="space-y-8 relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
               <CreditCard className="w-5 h-5" />
            </span>
            Payment Approvals
          </h1>
          <p className="text-slate-600 mt-2 font-medium">Verify deposited funds and manage user balances.</p>
        </div>
        
        <Button onClick={() => setRequestModal(true)} variant="primary" className="px-6 py-2.5">
          <Plus className="w-5 h-5 mr-2" /> New Payment Request
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner size="lg" className="text-indigo-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-10 text-center text-slate-400 m-6">
              <div className="w-20 h-20 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-slate-800 font-bold text-lg mb-2">No pending payments</p>
              <p className="text-slate-400 font-medium">All deposits have been verified!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 sm:p-5 bg-white hover:bg-indigo-50/30 transition-colors border-b border-slate-100">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {payment.user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{payment.user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{payment.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-emerald-600">₹{payment.amount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-400">{new Date(payment.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TXN:</span>
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[180px] sm:max-w-full">{payment.transactionId}</span>
                  </div>

                  {/* Action button — always visible */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewModal({ open: true, payment })}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                  >
                    Verify &amp; Review <Eye className="w-4 h-4 ml-1.5 inline" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
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
             
             <div className="flex justify-between items-start pb-6 border-b border-slate-200">
               <div>
                  <h3 className="text-2xl font-black text-emerald-600 mb-1">₹{viewModal.payment.amount.toLocaleString('en-IN')}</h3>
                  <p className="text-slate-500 font-medium">Deposit Amount</p>
               </div>
               <Badge variant="proof-uploaded">Awaiting Verification</Badge>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Proof Image */}
                <div className="space-y-4">
                   <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Payment Screenshot</p>
                   <a href={viewModal.payment.screenshotUrl} target="_blank" rel="noreferrer" className="block relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                     <img src={viewModal.payment.screenshotUrl} alt="Proof" className="w-full h-auto object-contain bg-slate-100 max-h-[300px]" />
                     <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Eye className="w-10 h-10 text-white" />
                     </div>
                   </a>
                </div>

                {/* Details */}
                <div className="space-y-6">
                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                      <h4 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">User Details</h4>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Name</p>
                         <p className="text-slate-700 font-medium">{viewModal.payment.user.fullName}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Email</p>
                         <p className="text-slate-700 font-medium">{viewModal.payment.user.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Balance</p>
                         <p className="text-emerald-600 font-bold">₹{viewModal.payment.user.totalPaid.toLocaleString('en-IN')}</p>
                      </div>
                   </div>

                   {viewModal.payment.account && (
                     <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5 mt-6">
                        <h4 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Account Details</h4>
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Plan</p>
                           <p className="text-slate-700 font-medium">{viewModal.payment.account.plan}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">MT5 ID</p>
                           <p className="text-slate-800 font-mono font-bold">{viewModal.payment.account.mt5Id}</p>
                        </div>
                     </div>
                   )}

                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                      <h4 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Transaction Details</h4>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
                         <p className="text-slate-800 font-mono font-bold">{viewModal.payment.transactionId}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Submitted On</p>
                         <p className="text-slate-700 font-medium">{new Date(viewModal.payment.submittedAt).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Actions */}
             <div className="pt-6 border-t border-slate-200 flex gap-4">
               <Button
                 variant="danger"
                 className="flex-1"
                 onClick={() => setRejectModal({ open: true, id: viewModal.payment!.id })}
                 disabled={actionLoading}
               >
                 <XCircle className="w-5 h-5 mr-2" /> Reject Proof
               </Button>
               <Button
                 variant="primary"
                 className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                 onClick={() => handleApprove(viewModal.payment!.id)}
                 loading={actionLoading}
               >
                 <CheckCircle2 className="w-5 h-5 mr-2" /> Approve &amp; Credit
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
             <label className="text-sm font-bold text-slate-700">Reason for Rejection *</label>
             <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Fake screenshot, unmatched transaction ID..."
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20 rounded-xl outline-none min-h-[120px] resize-none"
             />
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setRejectModal({ open: false, id: '' })} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={actionLoading}>Cancel</Button>
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
          <p className="text-sm text-slate-500 mb-4 font-medium">
            Send a deposit request to a user. They will receive a notification and can upload proof from their dashboard.
          </p>
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">User Email *</label>
               <input
                  type="email"
                  value={requestForm.userEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, userEmail: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-xl outline-none"
                  required
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Amount (₹) *</label>
               <input
                  type="number"
                  min="1"
                  value={requestForm.amount}
                  onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-xl outline-none font-mono"
                  required
               />
             </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-200">
             <Button type="button" variant="ghost" onClick={() => setRequestModal(false)} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={actionLoading}>Cancel</Button>
             <Button type="submit" variant="primary" loading={actionLoading} className="flex-1">Send Request</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
