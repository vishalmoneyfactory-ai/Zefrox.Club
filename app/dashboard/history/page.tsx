'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Clock, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import KycStatusBanner from '@/components/features/KycStatusBanner';
import PaymentProofModal from '@/components/features/PaymentProofModal';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface User {
  id: string;
  fullName: string;
  email: string;
  totalPaid: number;
  kycStatus: string | null;
}

interface PaymentRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  payment?: { id: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  screenshotUrl: string;
  transactionId: string;
  submittedAt: string;
  rejectionReason: string | null;
  paymentRequest: {
    id: string;
    amount: number;
  };
}

export default function DashboardHistoryPage() {
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');
  const [proofModal, setProofModal] = useState<{ open: boolean; requestId: string; amount: number }>({
    open: false,
    requestId: '',
    amount: 0,
  });
  const [screenshotModal, setScreenshotModal] = useState<{ open: boolean; url: string }>({
    open: false,
    url: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [userRes, requestsRes, paymentsRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/payments/my-requests'),
        api.get('/api/payments'),
      ]);
      setUser(userRes.data);
      setRequests(requestsRes.data);
      setPayments(paymentsRes.data);
    } catch {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-aurora-cyan" />
      </div>
    );
  }

  const pendingRequestsCount = requests.filter((r) => !r.payment).length;
  const approvedPaymentsCount = payments.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="space-y-6 relative z-10 selection:bg-aurora-cyan/30 selection:text-aurora-cyan pb-12">
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-aurora-cyan/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-aurora-indigo/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <KycStatusBanner status={user?.kycStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | null} rejectionReason={null} />
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <h1 className="text-3xl font-black text-white drop-shadow-sm">Payment History</h1>
        <p className="text-slate-400 mt-1 font-medium">Manage your deposits and review past transactions.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Paid", value: `₹${(user?.totalPaid || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-aurora-cyan", bg: "bg-aurora-cyan/10", border: "border-aurora-cyan/30" },
          { title: "Pending Requests", value: pendingRequestsCount, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
          { title: "Approved Payments", value: approvedPaymentsCount, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
          { title: "KYC Status", value: user?.kycStatus || 'Not Submitted', icon: AlertCircle, color: user?.kycStatus === 'APPROVED' ? "text-green-400" : user?.kycStatus === 'REJECTED' ? "text-red-400" : "text-yellow-400", bg: user?.kycStatus === 'APPROVED' ? "bg-green-400/10" : user?.kycStatus === 'REJECTED' ? "bg-red-400/10" : "bg-yellow-400/10", border: user?.kycStatus === 'APPROVED' ? "border-green-400/30" : user?.kycStatus === 'REJECTED' ? "border-red-400/30" : "border-yellow-400/30" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}>
            <Card glass className="flex items-center gap-4 h-full border-white/5 bg-slate-900/40">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border} border shadow-inner`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card glass className="p-0 overflow-hidden border-white/5 bg-slate-900/40">
          <div className="border-b border-white/5 bg-slate-950/30 backdrop-blur-md">
            <div className="flex">
              <button
                onClick={() => setActiveTab('requests')}
                className={`relative flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'requests' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'requests' && (
                  <motion.div layoutId="history-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-aurora-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                )}
                Pending Requests
                {pendingRequestsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-aurora-cyan/20 border border-aurora-cyan/50 text-aurora-cyan text-xs font-bold rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`relative flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'history' && (
                  <motion.div layoutId="history-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-aurora-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                )}
                Payment History
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'requests' ? (
                <motion.div key="requests" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                  {requests.filter((r) => !r.payment).length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <Clock className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-white font-semibold text-lg">No pending requests</p>
                      <p className="text-slate-400 text-sm mt-1">Payment requests from admin will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {requests.filter((r) => !r.payment).map((request, index) => (
                        <motion.div key={request.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                          <Card glass hover glow className="p-5 flex flex-col justify-between h-full border-aurora-cyan/20 bg-slate-900/60">
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="text-3xl font-black text-white drop-shadow-md">
                                    ₹{request.amount.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 font-medium">
                                    Requested on {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <Badge variant="pending">Pending</Badge>
                              </div>
                            </div>
                            <Button
                              variant="glow"
                              disabled={user?.kycStatus !== 'APPROVED'}
                              onClick={() => setProofModal({ open: true, requestId: request.id, amount: request.amount })}
                              className="w-full mt-4"
                            >
                              {user?.kycStatus !== 'APPROVED' ? 'Complete KYC First' : 'Upload Payment Proof'}
                            </Button>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                  {payments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <IndianRupee className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-white font-semibold text-lg">No payments yet</p>
                      <p className="text-slate-400 text-sm mt-1">Your payment history will appear here</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left text-xs uppercase text-slate-500 font-bold px-4 py-4 tracking-wider">Date</th>
                              <th className="text-left text-xs uppercase text-slate-500 font-bold px-4 py-4 tracking-wider">Amount</th>
                              <th className="text-left text-xs uppercase text-slate-500 font-bold px-4 py-4 tracking-wider">Status</th>
                              <th className="text-left text-xs uppercase text-slate-500 font-bold px-4 py-4 tracking-wider">Transaction ID</th>
                              <th className="text-left text-xs uppercase text-slate-500 font-bold px-4 py-4 tracking-wider">Proof</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {payments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4 text-sm text-slate-300 font-medium">
                                  {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-white">
                                  ₹{payment.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-4">
                                  <Badge variant={payment.status === 'APPROVED' ? 'approved' : payment.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                                    {payment.status.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-400 font-mono">
                                  {payment.transactionId.substring(0, 12)}...
                                </td>
                                <td className="px-4 py-4">
                                  <button onClick={() => setScreenshotModal({ open: true, url: payment.screenshotUrl })} className="text-aurora-cyan hover:text-white transition-colors p-2 bg-aurora-cyan/10 hover:bg-aurora-cyan/20 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Rejection reasons */}
                        {payments.filter((p) => p.status === 'REJECTED' && p.rejectionReason).map((p) => (
                          <div key={`rej-${p.id}`} className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-200 flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-bold text-red-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Rejected (₹{p.amount.toLocaleString('en-IN')}):</span>
                            <span>{p.rejectionReason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {payments.map((payment) => (
                          <Card key={payment.id} glass className="p-4 bg-slate-900/60 border-white/5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-xl font-bold text-white mb-1">₹{payment.amount.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <Badge variant={payment.status === 'APPROVED' ? 'approved' : payment.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                                {payment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Transaction ID</p>
                                <p className="text-xs font-mono text-slate-300">{payment.transactionId.substring(0, 16)}...</p>
                              </div>
                              <button onClick={() => setScreenshotModal({ open: true, url: payment.screenshotUrl })} className="text-xs text-aurora-cyan font-bold py-2 px-3 bg-aurora-cyan/10 hover:bg-aurora-cyan/20 border border-aurora-cyan/20 rounded-lg transition-colors flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" /> Proof
                              </button>
                            </div>
                            {payment.status === 'REJECTED' && payment.rejectionReason && (
                              <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-200">
                                <span className="font-bold text-red-400">Rejected:</span> {payment.rejectionReason}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <PaymentProofModal
        isOpen={proofModal.open}
        onClose={() => setProofModal({ open: false, requestId: '', amount: 0 })}
        paymentRequestId={proofModal.requestId}
        amount={proofModal.amount}
        onSuccess={() => {
          setProofModal({ open: false, requestId: '', amount: 0 });
          showSuccess('Payment proof uploaded successfully!');
          fetchData();
        }}
      />

      <ScreenshotModal
        isOpen={screenshotModal.open}
        onClose={() => setScreenshotModal({ open: false, url: '' })}
        imageUrl={screenshotModal.url}
        title="Payment Proof"
      />
    </div>
  );
}
