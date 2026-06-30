'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, Camera, CheckCircle2, XCircle, FileText, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  aadhaarNumber: string;
  aadhaarPhotoUrl: string;
  selfieUrl: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  user: { id: string; fullName: string; email: string };
}

export default function AdminKycPage() {
  const { showSuccess, showError } = useToast();
  const [kycRecords, setKycRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab === 'ALL' ? '?all=true' : '?all=true&status=PENDING';
      const { data } = await api.get(`/api/kyc${params}`);
      setKycRecords(data);
    } catch {
      showError('Failed to load KYC records');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showError]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const handleApprove = async (kycId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${kycId}/approve`);
      showSuccess('KYC approved');
      setSelectedKyc(null);
      fetchKyc();
    } catch {
      showError('Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectReason.trim()) {
      showError('Please enter a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${kycId}/reject`, { reason: rejectReason });
      showSuccess('KYC rejected');
      setSelectedKyc(null);
      setShowRejectInput(false);
      setRejectReason('');
      fetchKyc();
    } catch {
      showError('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

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
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px] translate-x-1/3" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-yellow-400" /> KYC Verification
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Review and verify user identity documents</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-900/60 border border-white/5 rounded-xl p-1.5 w-fit backdrop-blur-md">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'PENDING' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'PENDING' && (
                <motion.div layoutId="kyc-tab" className="absolute inset-0 bg-yellow-500/20 border border-yellow-500/50 rounded-lg shadow-[0_0_10px_rgba(234,179,8,0.2)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10 flex items-center gap-2">Pending {activeTab === 'PENDING' && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                activeTab === 'ALL' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'ALL' && (
                <motion.div layoutId="kyc-tab" className="absolute inset-0 bg-white/10 border border-white/20 rounded-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10">All Records</span>
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" className="text-yellow-400" /></div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card glass className="p-0 border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-white/5">
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">User</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Email</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden sm:table-cell">Submitted</th>
                      <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Status</th>
                      <th className="text-right text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {kycRecords.map((kyc) => (
                        <motion.tr
                          key={kyc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                          onClick={() => { setSelectedKyc(kyc); setShowRejectInput(false); setRejectReason(''); }}
                        >
                          <td className="px-6 py-4 font-bold text-white text-sm">{kyc.user.fullName}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{kyc.user.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell font-medium">
                            {new Date(kyc.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={kyc.status === 'APPROVED' ? 'approved' : kyc.status === 'REJECTED' ? 'rejected' : 'pending'}>
                              {kyc.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 text-xs font-bold text-aurora-cyan bg-aurora-cyan/10 hover:bg-aurora-cyan/20 border border-aurora-cyan/20 rounded-md transition-colors inline-flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); setSelectedKyc(kyc); setShowRejectInput(false); setRejectReason(''); }}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {kycRecords.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 font-medium">{activeTab === 'PENDING' ? 'No pending KYC submissions' : 'No KYC records found'}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* KYC Detail Modal */}
      <Modal isOpen={!!selectedKyc} onClose={() => { setSelectedKyc(null); setShowRejectInput(false); }} title="KYC Verification Details" size="xl">
        {selectedKyc && (
          <div className="space-y-8 animate-fade-in text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                  <span className="text-lg font-black text-white">{selectedKyc.user.fullName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-black text-white text-xl tracking-tight">{selectedKyc.user.fullName}</p>
                  <p className="text-sm text-slate-400">{selectedKyc.user.email}</p>
                </div>
              </div>
              <Badge variant={selectedKyc.status === 'APPROVED' ? 'approved' : selectedKyc.status === 'REJECTED' ? 'rejected' : 'pending'}>
                {selectedKyc.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-6 rounded-2xl border border-white/5">
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Full Name</p><p className="text-sm font-bold">{selectedKyc.fullName}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Address</p><p className="text-sm font-bold">{selectedKyc.address}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">UPI ID</p><p className="text-sm font-bold text-aurora-cyan">{selectedKyc.upiId}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Bank Account</p><p className="text-sm font-bold font-mono">{selectedKyc.bankAccount}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">IFSC Code</p><p className="text-sm font-bold">{selectedKyc.ifscCode}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Aadhaar Number</p><p className="text-sm font-bold">{selectedKyc.aadhaarNumber}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Submitted At</p><p className="text-sm font-bold">{new Date(selectedKyc.submittedAt).toLocaleString('en-IN')}</p></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><Camera className="w-4 h-4 text-aurora-purple" /> Selfie</p>
                <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/10" onClick={() => setImageModal({ open: true, url: selectedKyc.selfieUrl, title: 'KYC Selfie' })}>
                  <img src={selectedKyc.selfieUrl} alt="KYC Selfie" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                    <Eye className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-aurora-cyan" /> Aadhaar Card</p>
                <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/10 bg-slate-900" onClick={() => setImageModal({ open: true, url: selectedKyc.aadhaarPhotoUrl, title: 'KYC Aadhaar Card' })}>
                  <img src={selectedKyc.aadhaarPhotoUrl} alt="KYC Aadhaar Card" className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                    <Eye className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            </div>

            {selectedKyc.status === 'PENDING' && (
              <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                {showRejectInput ? (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-300 ml-1">Rejection Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter the reason for rejecting this KYC..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-red-500/30 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm resize-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="danger" onClick={() => handleReject(selectedKyc.id)} disabled={actionLoading} loading={actionLoading} className="flex-1">
                        Confirm Rejection
                      </Button>
                      <button onClick={() => setShowRejectInput(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/5">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="glow" onClick={() => handleApprove(selectedKyc.id)} disabled={actionLoading} loading={actionLoading} className="flex-1 !bg-green-600 hover:!bg-green-500 !border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Approve KYC
                    </Button>
                    <button onClick={() => setShowRejectInput(true)} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-colors border border-red-500/20 flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Reject KYC
                    </button>
                  </div>
                )}
              </div>
            )}
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
