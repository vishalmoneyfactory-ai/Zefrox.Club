'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import KycStatusBanner from '@/components/features/KycStatusBanner';
import StatsCard from '@/components/features/StatsCard';
import PaymentProofModal from '@/components/features/PaymentProofModal';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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

export default function DashboardPage() {
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
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingRequestsCount = requests.filter((r) => !r.payment).length;
  const approvedPaymentsCount = payments.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KYC Banner */}
      <KycStatusBanner status={user?.kycStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | null} rejectionReason={null} />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Paid"
          value={`₹${(user?.totalPaid || 0).toLocaleString('en-IN')}`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequestsCount}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Approved Payments"
          value={approvedPaymentsCount}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="KYC Status"
          value={user?.kycStatus || 'Not Submitted'}
          color={user?.kycStatus === 'APPROVED' ? 'green' : user?.kycStatus === 'REJECTED' ? 'red' : 'yellow'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
            </svg>
          }
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Pending Requests
              {pendingRequestsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'requests' ? (
            <div>
              {requests.filter((r) => !r.payment).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No pending requests</p>
                  <p className="text-slate-400 text-sm mt-1">Payment requests from admin will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests
                    .filter((r) => !r.payment)
                    .map((request) => (
                      <div
                        key={request.id}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">
                              ₹{request.amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <Badge variant="pending">Pending</Badge>
                        </div>
                        <button
                          onClick={() =>
                            setProofModal({ open: true, requestId: request.id, amount: request.amount })
                          }
                          disabled={user?.kycStatus !== 'APPROVED'}
                          className="w-full mt-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {user?.kycStatus !== 'APPROVED' ? 'Complete KYC First' : 'Upload Payment Proof'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                  <p className="text-slate-500 font-medium">No payments yet</p>
                  <p className="text-slate-400 text-sm mt-1">Your payment history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left text-xs uppercase text-slate-500 font-semibold px-4 py-3">Date</th>
                        <th className="text-left text-xs uppercase text-slate-500 font-semibold px-4 py-3">Amount</th>
                        <th className="text-left text-xs uppercase text-slate-500 font-semibold px-4 py-3">Status</th>
                        <th className="text-left text-xs uppercase text-slate-500 font-semibold px-4 py-3">Transaction ID</th>
                        <th className="text-left text-xs uppercase text-slate-500 font-semibold px-4 py-3">Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 text-sm text-slate-600">
                            {new Date(payment.submittedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                            ₹{payment.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              variant={
                                payment.status === 'APPROVED'
                                  ? 'approved'
                                  : payment.status === 'REJECTED'
                                  ? 'rejected'
                                  : 'proof-uploaded'
                              }
                            >
                              {payment.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-500 font-mono">
                            {payment.transactionId.substring(0, 12)}...
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() =>
                                setScreenshotModal({ open: true, url: payment.screenshotUrl })
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Rejection reasons */}
                  {payments
                    .filter((p) => p.status === 'REJECTED' && p.rejectionReason)
                    .map((p) => (
                      <div key={`rej-${p.id}`} className="mt-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                        <span className="font-medium">Rejected (₹{p.amount.toLocaleString('en-IN')}):</span> {p.rejectionReason}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
