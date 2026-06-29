'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Verification</h1>
        <p className="text-slate-500 mt-1">{payments.length} payments pending verification</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">User</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Amount</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden sm:table-cell">Submitted</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden md:table-cell">Days Pending</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{payment.user.fullName}</p>
                      <p className="text-xs text-slate-500">{payment.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                    {new Date(payment.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {(() => {
                      const days = getDaysPending(payment.submittedAt);
                      return (
                        <span
                          className={`text-sm font-medium ${
                            days > 3 ? 'text-red-600' : days > 1 ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        >
                          {days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''}`}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowRejectInput(false);
                        setRejectReason('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 font-medium">All payments verified!</p>
            <p className="text-slate-400 text-sm mt-1">No pending payment proofs to review</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => {
          setSelectedPayment(null);
          setShowRejectInput(false);
        }}
        title="Payment Verification"
        size="xl"
      >
        {selectedPayment && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Screenshot */}
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Payment Screenshot</p>
              <img
                src={selectedPayment.screenshotUrl}
                alt="Payment proof"
                className="w-full rounded-xl border border-slate-200 object-contain max-h-[500px]"
              />
            </div>

            {/* Details sidebar */}
            <div className="lg:w-72 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">User</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPayment.user.fullName}</p>
                  <p className="text-xs text-slate-500">{selectedPayment.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Paid (Lifetime)</p>
                  <p className="text-sm font-medium text-slate-900">₹{selectedPayment.user.totalPaid.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-500 uppercase font-semibold">Payment Amount</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">₹{selectedPayment.amount.toLocaleString('en-IN')}</p>
              </div>

              <div className="text-sm text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Submitted</span>
                  <span>{new Date(selectedPayment.submittedAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Request Date</span>
                  <span>{new Date(selectedPayment.paymentRequest.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              {showRejectInput ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                  <button
                    onClick={() => handleReject(selectedPayment.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Spinner size="sm" />}
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleApprove(selectedPayment.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading && <Spinner size="sm" />}
                    Approve Payment
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Reject Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
