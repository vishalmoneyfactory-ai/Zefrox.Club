'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Eye, CheckCircle2, XCircle, AlertTriangle, IndianRupee, Calendar } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  screenshotUrl: string;
  status: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  transactionId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    totalPaid: number;
  };
  paymentRequest: {
    id: string;
    amount: number;
    createdAt: string;
  };
}

export default function AdminPaymentsPage() {
  const { showSuccess, showError } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });

  const fetchPayments = useCallback(async () => {
    try {
      const { data } = await api.get('/api/payments/pending-verification');
      setPayments(data);
    } catch {
      showError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApprove = async (paymentId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/api/payments/${paymentId}/approve`);
      showSuccess('Payment approved successfully');
      setSelectedPayment(null);
      fetchPayments();
    } catch {
      showError('Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!rejectReason.trim()) {
      showError('Please enter a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/payments/${paymentId}/reject`, { reason: rejectReason });
      showSuccess('Payment rejected');
      setSelectedPayment(null);
      setShowRejectInput(false);
      setRejectReason('');
      fetchPayments();
    } catch {
      showError('Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysPending = (submittedAt: string) => {
    const diff = Date.now() - new Date(submittedAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-aurora-cyan" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="relative z-10 space-y-6 animate-fade-in pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-aurora-indigo/10 rounded-full blur-[120px] -translate-x-1/3" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-aurora-indigo" /> Payment Ledger
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Verify pending payment proofs ({payments.length} pending)</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass className="p-0 border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-white/5">
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">User</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Amount</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden sm:table-cell">Submitted</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden md:table-cell">Days Pending</th>
                    <th className="text-right text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {payments.map((payment) => {
                      const days = getDaysPending(payment.submittedAt);
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                          onClick={() => { setSelectedPayment(payment); setShowRejectInput(false); setRejectReason(''); }}
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-white">{payment.user.fullName}</p>
                            <p className="text-xs text-slate-400 mt-1">{payment.user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-aurora-cyan/10 text-aurora-cyan text-sm font-black border border-aurora-cyan/20">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell font-medium">
                            {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${days > 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : days > 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                              {days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 text-xs font-bold text-aurora-indigo bg-aurora-indigo/10 hover:bg-aurora-indigo/20 border border-aurora-indigo/20 rounded-md transition-colors inline-flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); setShowRejectInput(false); setRejectReason(''); }}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-300 font-bold text-lg mb-1">All Caught Up!</p>
                <p className="text-slate-500 font-medium">No pending payment proofs to review right now.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Payment Detail Modal */}
      <Modal isOpen={!!selectedPayment} onClose={() => { setSelectedPayment(null); setShowRejectInput(false); }} title="Verify Payment Proof" size="xl">
        {selectedPayment && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in text-white">
            {/* Screenshot */}
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-aurora-cyan" /> Proof Screenshot
              </p>
              <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/10 bg-slate-900/50 flex items-center justify-center min-h-[300px]" onClick={() => setImageModal({ open: true, url: selectedPayment.screenshotUrl, title: 'Payment Proof' })}>
                <img
                  src={selectedPayment.screenshotUrl}
                  alt="Payment proof"
                  className="w-full h-full object-contain max-h-[500px] group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <Eye className="w-10 h-10 text-white drop-shadow-md" />
                </div>
              </div>
            </div>

            {/* Details sidebar */}
            <div className="lg:w-80 space-y-6">
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 space-y-4 shadow-inner">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">User Details</p>
                  <p className="text-base font-bold text-white">{selectedPayment.user.fullName}</p>
                  <p className="text-xs text-slate-400 font-medium">{selectedPayment.user.email}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Lifetime Value</p>
                  <p className="text-sm font-black text-green-400">₹{selectedPayment.user.totalPaid.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-aurora-cyan/10 rounded-2xl p-5 border border-aurora-cyan/20 text-center shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <p className="text-[10px] text-aurora-cyan uppercase font-black tracking-widest flex items-center justify-center gap-1 mb-2">
                  <IndianRupee className="w-3 h-3" /> Claimed Amount
                </p>
                <p className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                  ₹{selectedPayment.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> Submitted</span>
                  <span className="font-bold text-white">{new Date(selectedPayment.submittedAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-slate-400 font-medium">Requested</span>
                  <span className="font-bold text-slate-300">{new Date(selectedPayment.paymentRequest.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              {showRejectInput ? (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Rejection Reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Why is this proof invalid?"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-950/80 rounded-xl border border-red-500/30 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm resize-none transition-all"
                    />
                  </div>
                  <Button variant="danger" onClick={() => handleReject(selectedPayment.id)} disabled={actionLoading} loading={actionLoading} className="w-full py-3">
                    Confirm Rejection
                  </Button>
                  <button onClick={() => setShowRejectInput(false)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/5">
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Button variant="glow" onClick={() => handleApprove(selectedPayment.id)} disabled={actionLoading} loading={actionLoading} className="w-full py-3 !bg-green-600 hover:!bg-green-500 !border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Approve Payment
                  </Button>
                  <button onClick={() => setShowRejectInput(true)} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-colors border border-red-500/20 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Reject Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ScreenshotModal
        isOpen={imageModal.open}
        onClose={() => setImageModal({ open: false, url: '', title: '' })}
        imageUrl={imageModal.url}
        title={imageModal.title}
      />
    </div>
  );
}
