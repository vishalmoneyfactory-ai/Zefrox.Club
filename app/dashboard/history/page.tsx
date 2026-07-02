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
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  const pendingRequestsCount = requests.filter((r) => !r.payment).length;
  const approvedPaymentsCount = payments.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="space-y-8 relative z-10 selection:bg-blue-500/30 selection:text-white pb-12">
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <KycStatusBanner status={user?.kycStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | null} rejectionReason={null} />
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <h1 className="text-3xl font-black text-white drop-shadow-sm">Payment History</h1>
        <p className="text-slate-400 mt-2 font-medium">Manage your deposits and review past transactions.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Paid", value: `₹${(user?.totalPaid || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { title: "Pending Requests", value: pendingRequestsCount, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
          { title: "Approved Payments", value: approvedPaymentsCount, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { title: "KYC Status", value: user?.kycStatus || 'Not Submitted', icon: AlertCircle, color: user?.kycStatus === 'APPROVED' ? "text-emerald-400" : user?.kycStatus === 'REJECTED' ? "text-red-400" : "text-yellow-400", bg: user?.kycStatus === 'APPROVED' ? "bg-emerald-500/10" : user?.kycStatus === 'REJECTED' ? "bg-red-500/10" : "bg-yellow-500/10", border: user?.kycStatus === 'APPROVED' ? "border-emerald-500/20" : user?.kycStatus === 'REJECTED' ? "border-red-500/20" : "border-yellow-500/20" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}>
            <Card glass className="flex items-center gap-5 h-full">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} border shadow-inner`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs & Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card glass className="p-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="border-b border-white/10 bg-[#060a14]/40 backdrop-blur-md relative z-10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('requests')}
                className={`relative flex-1 sm:flex-none px-8 py-5 text-sm font-bold transition-all duration-300 ${
                  activeTab === 'requests' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'requests' && (
                  <motion.div layoutId="history-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
                Pending Requests
                {pendingRequestsCount > 0 && (
                  <span className="ml-3 px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`relative flex-1 sm:flex-none px-8 py-5 text-sm font-bold transition-all duration-300 ${
                  activeTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === 'history' && (
                  <motion.div layoutId="history-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
                Payment History
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 min-h-[400px] relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'requests' ? (
                <motion.div key="requests" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                  {requests.filter((r) => !r.payment).length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 mx-auto bg-[#111827]/60 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                        <Clock className="w-10 h-10 text-slate-500" />
                      </div>
                      <p className="text-white font-bold text-xl">No pending requests</p>
                      <p className="text-slate-400 text-sm mt-2 font-medium">Payment requests from admin will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {requests.filter((r) => !r.payment).map((request, index) => (
                         <motion.div key={request.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                           <Card glass glow className="p-6 flex flex-col justify-between h-full bg-[#111827]/40 border-white/10 hover:border-blue-500/30">
                             <div>
                               <div className="flex items-start justify-between mb-6">
                                 <div>
                                   <p className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                     ₹{request.amount.toLocaleString('en-IN')}
                                   </p>
                                   <p className="text-xs text-slate-400 mt-2 font-semibold tracking-wide">
                                     REQ: {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                                   </p>
                                 </div>
                                 <Badge variant="pending">Pending</Badge>
                               </div>
                             </div>
                             <Button
                               variant="primary"
                               disabled={user?.kycStatus !== 'APPROVED'}
                               onClick={() => setProofModal({ open: true, requestId: request.id, amount: request.amount })}
                               className="w-full mt-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                             >
                               {user?.kycStatus !== 'APPROVED' ? 'Complete KYC First' : 'Upload Proof'}
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
                    <div className="text-center py-20">
                      <div className="w-24 h-24 mx-auto bg-[#111827]/60 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                        <IndianRupee className="w-10 h-10 text-slate-500" />
                      </div>
                      <p className="text-white font-bold text-xl">No payments yet</p>
                      <p className="text-slate-400 text-sm mt-2 font-medium">Your payment history will appear here</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-400">
                              <th className="text-xs uppercase font-bold px-6 py-5 tracking-wider">Date</th>
                              <th className="text-xs uppercase font-bold px-6 py-5 tracking-wider">Amount</th>
                              <th className="text-xs uppercase font-bold px-6 py-5 tracking-wider">Status</th>
                              <th className="text-xs uppercase font-bold px-6 py-5 tracking-wider">Transaction ID</th>
                              <th className="text-xs uppercase font-bold px-6 py-5 tracking-wider">Proof</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                            {payments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5 text-sm font-semibold">
                                  {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-5 text-base font-bold text-white">
                                  ₹{payment.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-5">
                                  <Badge variant={payment.status === 'APPROVED' ? 'approved' : payment.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                                    {payment.status.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="px-6 py-5 text-sm text-slate-400 font-mono">
                                  {payment.transactionId.substring(0, 12)}...
                                </td>
                                <td className="px-6 py-5">
                                  <button onClick={() => setScreenshotModal({ open: true, url: payment.screenshotUrl })} className="text-blue-400 hover:text-white transition-colors p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Rejection reasons */}
                        {payments.filter((p) => p.status === 'REJECTED' && p.rejectionReason).map((p) => (
                          <div key={`rej-${p.id}`} className="mt-4 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-200 flex flex-col sm:flex-row sm:items-center gap-3 backdrop-blur-md">
                            <span className="font-bold text-red-400 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Rejected (₹{p.amount.toLocaleString('en-IN')}):</span>
                            <span>{p.rejectionReason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {payments.map((payment) => (
                          <Card key={payment.id} glass className="p-5 bg-[#111827]/40 border-white/5">
                            <div className="flex justify-between items-start mb-5">
                              <div>
                                <p className="text-2xl font-bold text-white mb-1">₹{payment.amount.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">
                                  {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                                </p>
                              </div>
                              <Badge variant={payment.status === 'APPROVED' ? 'approved' : payment.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                                {payment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Transaction ID</p>
                                <p className="text-xs font-mono text-slate-300">{payment.transactionId.substring(0, 16)}...</p>
                              </div>
                              <button onClick={() => setScreenshotModal({ open: true, url: payment.screenshotUrl })} className="text-xs text-blue-400 font-bold py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" /> Proof
                              </button>
                            </div>
                            {payment.status === 'REJECTED' && payment.rejectionReason && (
                              <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-200">
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
