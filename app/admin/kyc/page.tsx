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
    <div className="space-y-8 relative z-10 selection:bg-blue-500/30 selection:text-white pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
               <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </span>
            KYC Verification
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Review and verify user identity documents.</p>
        </div>
        
        <div className="flex bg-[#111827]/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                filter === f
                  ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card glass className="p-0 overflow-hidden bg-[#0b1221]/80 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner size="lg" className="text-blue-500" />
            </div>
          ) : kycRecords.length === 0 ? (
            <div className="p-20 text-center">
               <div className="w-20 h-20 mx-auto bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <ShieldCheck className="w-8 h-8 text-slate-500" />
               </div>
               <p className="text-white font-bold text-lg mb-2">No {filter.toLowerCase()} KYC records found</p>
               <p className="text-slate-400 font-medium">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#111827]/60 backdrop-blur-md">
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Aadhaar</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {kycRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-0.5">{record.fullName}</div>
                        <div className="text-xs text-slate-500 font-medium">{record.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {new Date(record.submittedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                           {record.aadhaarNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          record.status === 'APPROVED' ? 'approved' : 
                          record.status === 'REJECTED' ? 'rejected' : 'pending'
                        }>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewModal({ open: true, record })}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Review <Eye className="w-4 h-4 ml-2 inline" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
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
             <div className="flex justify-between items-start pb-6 border-b border-white/10">
               <div>
                  <h3 className="text-2xl font-black text-white mb-2">{viewModal.record.fullName}</h3>
                  <p className="text-slate-400 font-medium">User ID: <span className="font-mono text-slate-300">{viewModal.record.userId}</span></p>
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
                   <div className="bg-[#111827] rounded-2xl p-4 border border-white/5 shadow-inner">
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Selfie</p>
                      <a href={viewModal.record.selfieUrl} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden">
                        <img src={viewModal.record.selfieUrl} alt="Selfie" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-[#060a14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <Eye className="w-8 h-8 text-white" />
                        </div>
                      </a>
                   </div>
                   
                   {viewModal.record.aadhaarPhotoUrl && (
                    <div className="bg-[#111827] rounded-2xl p-4 border border-white/5 shadow-inner">
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Aadhaar Document</p>
                        <a href={viewModal.record.aadhaarPhotoUrl} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden">
                          <img src={viewModal.record.aadhaarPhotoUrl} alt="Aadhaar" className="w-full h-48 object-contain bg-slate-900" />
                          <div className="absolute inset-0 bg-[#060a14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <Eye className="w-8 h-8 text-white" />
                          </div>
                        </a>
                     </div>
                   )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                   <div className="bg-[#111827]/40 rounded-2xl p-6 border border-white/5 space-y-5">
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p>
                         <p className="text-white font-medium">{viewModal.record.user.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Phone</p>
                         <p className="text-white font-medium">{viewModal.record.user.phone}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Address</p>
                         <p className="text-white font-medium leading-relaxed">{viewModal.record.address}</p>
                      </div>
                   </div>

                   <div className="bg-[#111827]/40 rounded-2xl p-6 border border-white/5 space-y-5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aadhaar No.</p>
                         <p className="text-white font-mono font-bold">{viewModal.record.aadhaarNumber}</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">UPI ID</p>
                         <p className="text-blue-400 font-bold">{viewModal.record.upiId}</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bank Account</p>
                         <p className="text-white font-bold">{viewModal.record.bankAccount}</p>
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IFSC Code</p>
                         <p className="text-white font-bold uppercase">{viewModal.record.ifscCode}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Actions */}
             {viewModal.record.status === 'PENDING' && (
                <div className="pt-6 border-t border-white/10 flex gap-4">
                  <Button
                    variant="danger"
                    className="flex-1 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    onClick={() => setRejectModal({ open: true, id: viewModal.record!.id })}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-5 h-5 mr-2" /> Reject KYC
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-4 items-start text-red-300 text-sm">
             <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
             <p>Rejection will notify the user and require them to resubmit their application.</p>
           </div>
           
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-300">Reason for Rejection *</label>
             <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Image is blurry, name mismatch..."
                className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 min-h-[120px] resize-none"
             />
           </div>

           <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setRejectModal({ open: false, id: '' })} className="flex-1 bg-slate-800 text-white" disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">Confirm Reject</Button>
           </div>
        </div>
      </Modal>

    </div>
  );
}
