'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';

interface PaymentReport {
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
    fullName: string;
    email: string;
  };
}

export default function AdminReportsPage() {
  const { showError } = useToast();
  const [payments, setPayments] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (searchQuery) params.set('search', searchQuery);

      const { data } = await api.get(`/api/payments?${params.toString()}`);
      setPayments(data);
      setCurrentPage(1);
    } catch {
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate, searchQuery, showError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApplyFilters = () => {
    fetchPayments();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const headers = [
      'User Name',
      'Email',
      'Amount',
      'Status',
      'Submitted Date',
      'Reviewed Date',
      'Transaction ID',
    ];

    const rows = filteredPayments.map((p) => [
      p.user.fullName,
      p.user.email,
      p.amount.toString(),
      p.status,
      new Date(p.submittedAt).toLocaleDateString('en-IN'),
      p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString('en-IN') : 'N/A',
      p.transactionId,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Client-side filtering for search (since API may not filter by all criteria)
  const filteredPayments = payments;

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">View and export payment reports</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredPayments.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="report-status" className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              id="report-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROOF_UPLOADED">Proof Uploaded</option>
            </select>
          </div>
          <div>
            <label htmlFor="report-start" className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="report-end" className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="report-search" className="block text-xs font-medium text-slate-500 mb-1">User Search</label>
            <input
              id="report-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or email..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">User</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Amount</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Status</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden md:table-cell">Submitted</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden lg:table-cell">Reviewed</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden lg:table-cell">Transaction ID</th>
                    <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{payment.user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{payment.user.email}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                        {new Date(payment.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                        {payment.reviewedAt
                          ? new Date(payment.reviewedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono hidden lg:table-cell">
                        {payment.transactionId.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setScreenshotUrl(payment.screenshotUrl)}
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
            {paginatedPayments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No payments match the selected filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredPayments.length)} of{' '}
                {filteredPayments.length} results
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Screenshot Modal */}
      <Modal
        isOpen={!!screenshotUrl}
        onClose={() => setScreenshotUrl(null)}
        title="Payment Screenshot"
        size="lg"
      >
        {screenshotUrl && (
          <img
            src={screenshotUrl}
            alt="Payment screenshot"
            className="w-full rounded-lg object-contain max-h-[70vh]"
          />
        )}
      </Modal>
    </div>
  );
}
