'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';

interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  address: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  aadhaarNumber: string;
  selfieUrl: string;
  aadhaarPhotoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  submittedAt: string;
  user: {
    email: string;
    phone: string;
  };
}

export default function AdminKycPage() {
  const { showSuccess, showError } = useToast();
  const [kycRecords, setKycRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  
  const [viewModal, setViewModal] = useState<{ open: boolean; record: KycRecord | null }>({ open: false, record: null });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchKyc();
  }, [filter]);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' ? '/api/kyc?all=true' : `/api/kyc?all=true&status=${filter}`;
      const { data } = await api.get(url);
      setKycRecords(data);
    } catch {
      showError('Failed to fetch KYC records');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${id}/approve`);
      setKycRecords(kycRecords.filter((r) => r.id !== id));
      showSuccess('KYC Approved');
      setViewModal({ open: false, record: null });
    } catch {
      showError('Failed to approve KYC');
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
      await api.post(`/api/kyc/${rejectModal.id}/reject`, { reason: rejectReason });
      setKycRecords(kycRecords.filter((r) => r.id !== rejectModal.id));
      showSuccess('KYC Rejected');
      setRejectModal({ open: false, id: '' });
      setRejectReason('');
      setViewModal({ open: false, record: null });
    } catch {
      showError('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </span>
            KYC Verification
          </h1>
          <p className="text-slate-600 mt-1 font-medium text-sm">Review and verify user identity documents.</p>
        </div>
        
        {/* Scrollable filter tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto max-w-full gap-1">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner size="lg" className="text-indigo-500" />
            </div>
          ) : kycRecords.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-10 text-center text-slate-400 m-6">
              <div className="w-20 h-20 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-800 font-bold text-lg mb-2">No {filter.toLowerCase()} KYC records found</p>
              <p className="text-slate-400 font-medium">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {kycRecords.map((record) => (
                <div key={record.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-white hover:bg-indigo-50/30 transition-colors border-b border-slate-100">
                  {/* Left: user info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                      {record.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{record.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{record.user.email}</p>
                    </div>
                  </div>

                  {/* Middle: metadata */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                    <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                      {record.aadhaarNumber || 'N/A'}
                    </div>
                    <p className="text-xs text-slate-400 font-medium hidden sm:block">
                      {new Date(record.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <Badge variant={
                      record.status === 'APPROVED' ? 'approved' : 
                      record.status === 'REJECTED' ? 'rejected' : 'pending'
                    }>
                      {record.status}
                    </Badge>
                  </div>

                  {/* Right: action */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewModal({ open: true, record })}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 w-full sm:w-auto"
                  >
                    Review <Eye className="w-4 h-4 ml-1.5 inline" />
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
        onClose={() => !actionLoading && setViewModal({ open: false, record: null })}
        title="Review KYC Application"
        size="xl"
      >
        {viewModal.record && (
          <div className="space-y-8">
             
             {/* Header */}
             <div className="flex justify-between items-start pb-6 border-b border-slate-200">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{viewModal.record.fullName}</h3>
                  <p className="text-slate-400 font-medium">User ID: <span className="font-mono text-slate-600">{viewModal.record.userId}</span></p>
               </div>
               <Badge variant={
                  viewModal.record.status === 'APPROVED' ? 'approved' : 
                  viewModal.record.status === 'REJECTED' ? 'rejected' : 'pending'
                }>
                  {viewModal.record.status}
                </Badge>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-6">
                   <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Selfie</p>
                      <a href={viewModal.record.selfieUrl} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden">
                        <img src={viewModal.record.selfieUrl} alt="Selfie" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <Eye className="w-8 h-8 text-white" />
                        </div>
                      </a>
                   </div>
                   
                   {viewModal.record.aadhaarPhotoUrl && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Aadhaar Document</p>
                        <a href={viewModal.record.aadhaarPhotoUrl} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden">
                          <img src={viewModal.record.aadhaarPhotoUrl} alt="Aadhaar" className="w-full h-48 object-contain bg-slate-100" />
                          <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <Eye className="w-8 h-8 text-white" />
                          </div>
                        </a>
                     </div>
                   )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Email</p>
                         <p className="text-slate-700 font-medium">{viewModal.record.user.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Phone</p>
                         <p className="text-slate-700 font-medium">{viewModal.record.user.phone}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Address</p>
                         <p className="text-slate-700 font-medium leading-relaxed">{viewModal.record.address}</p>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aadhaar No.</p>
                         <p className="text-slate-800 font-mono font-bold">{viewModal.record.aadhaarNumber}</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UPI ID</p>
                         <p className="text-indigo-600 font-bold">{viewModal.record.upiId}</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bank Account</p>
                         <p className="text-slate-800 font-bold">{viewModal.record.bankAccount}</p>
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IFSC Code</p>
                         <p className="text-slate-800 font-bold uppercase">{viewModal.record.ifscCode}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Actions */}
             {viewModal.record.status === 'PENDING' && (
                <div className="pt-6 border-t border-slate-200 flex gap-4">
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => setRejectModal({ open: true, id: viewModal.record!.id })}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-5 h-5 mr-2" /> Reject KYC
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleApprove(viewModal.record!.id)}
                    loading={actionLoading}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Approve KYC
                  </Button>
                </div>
             )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => !actionLoading && setRejectModal({ open: false, id: '' })}
        title="Reject KYC"
        size="sm"
      >
        <div className="space-y-6">
           <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-4 items-start text-red-600 text-sm">
             <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
             <p>Rejection will notify the user and require them to resubmit their application.</p>
           </div>
           
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">Reason for Rejection *</label>
             <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Image is blurry, name mismatch..."
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/20 rounded-xl outline-none min-h-[120px] resize-none"
             />
           </div>

           <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setRejectModal({ open: false, id: '' })} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">Confirm Reject</Button>
           </div>
        </div>
      </Modal>

    </div>
  );
}
