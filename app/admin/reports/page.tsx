'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Search, Filter, Eye, ChevronLeft, ChevronRight, CheckCircle2, IndianRupee } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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

  const filteredPayments = payments;
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-400" /> Financial Reports
            </h1>
            <p className="text-slate-400 mt-2 font-medium">View, filter, and export payment data</p>
          </div>
          <Button
            variant="glow"
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
            className="w-full sm:w-auto !bg-green-600/20 !border-green-500/50 !text-green-400 hover:!bg-green-600/30 hover:!text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-6 border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aurora-cyan opacity-50" />
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Filter className="w-4 h-4 text-aurora-cyan" /> Filter Reports
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label htmlFor="report-status" className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Status</label>
                <select
                  id="report-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 text-sm bg-slate-950/80 text-white transition-all shadow-inner"
                >
                  <option value="">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PROOF_UPLOADED">Pending</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="report-start" className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Start Date</label>
                <input
                  id="report-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 text-sm bg-slate-950/80 text-white transition-all shadow-inner [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="report-end" className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">End Date</label>
                <input
                  id="report-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 text-sm bg-slate-950/80 text-white transition-all shadow-inner [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="report-search" className="block text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 flex items-center gap-1"><Search className="w-3 h-3" /> Search</label>
                <input
                  id="report-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name or email..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 text-sm bg-slate-950/80 text-white transition-all shadow-inner placeholder-slate-600"
                />
              </div>
              <div className="flex items-end gap-2 pt-5 sm:pt-0">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-3 bg-aurora-cyan/20 hover:bg-aurora-cyan/30 border border-aurora-cyan/50 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Apply
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-green-400" />
          </div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card glass className="p-0 border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden relative z-0">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-white/5">
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">User</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden sm:table-cell">Email</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Amount</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Status</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden md:table-cell">Submitted</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden lg:table-cell">Reviewed</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden lg:table-cell">Txn ID</th>
                      <th className="text-right text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {paginatedPayments.map((payment) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-white">{payment.user.fullName}</td>
                          <td className="px-6 py-4 text-xs text-slate-400 hidden sm:table-cell">{payment.user.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 font-black text-green-400">
                              <IndianRupee className="w-3 h-3" /> {payment.amount.toLocaleString('en-IN')}
                            </span>
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
                          <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell font-medium">
                            {new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell font-medium">
                            {payment.reviewedAt
                              ? new Date(payment.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-mono hidden lg:table-cell opacity-50 hover:opacity-100 transition-opacity">
                            {payment.transactionId.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-right">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setScreenshotUrl(payment.screenshotUrl)} className="px-3 py-1.5 text-xs font-bold text-aurora-cyan bg-aurora-cyan/10 hover:bg-aurora-cyan/20 border border-aurora-cyan/20 rounded-md transition-colors inline-flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" /> View
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {paginatedPayments.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-300 font-bold text-lg mb-1">No Data Found</p>
                  <p className="text-slate-500 font-medium">No payments match your current filter criteria.</p>
                </div>
              )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <p className="text-sm font-medium text-slate-500 bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
                  Showing <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredPayments.length)}</span> of{' '}
                  <span className="text-white font-bold">{filteredPayments.length}</span> results
                </p>
                <div className="flex gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
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
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                            : 'hover:bg-white/10 text-slate-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Screenshot Modal */}
      <Modal
        isOpen={!!screenshotUrl}
        onClose={() => setScreenshotUrl(null)}
        title="Payment Proof Details"
        size="lg"
      >
        {screenshotUrl && (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 animate-fade-in p-4 flex justify-center items-center">
             <img
              src={screenshotUrl}
              alt="Payment screenshot"
              className="max-w-full rounded-xl object-contain max-h-[70vh] shadow-2xl"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
