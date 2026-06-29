'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ScreenshotModal from '@/components/features/ScreenshotModal';

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
  const [rejecting, setRejecting] = useState(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>
        <p className="text-slate-500 mt-1">Review and verify user identity documents</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'PENDING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">User</th>
                  <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Email</th>
                  <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Status</th>
                  <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kycRecords.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => { setSelectedKyc(kyc); setShowRejectInput(false); setRejectReason(''); }}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{kyc.user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{kyc.user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                      {new Date(kyc.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={kyc.status === 'APPROVED' ? 'approved' : kyc.status === 'REJECTED' ? 'rejected' : 'pending'}>
                        {kyc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={(e) => { e.stopPropagation(); setSelectedKyc(kyc); setShowRejectInput(false); setRejectReason(''); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {kycRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">{activeTab === 'PENDING' ? 'No pending KYC submissions' : 'No KYC records found'}</p>
            </div>
          )}
        </div>
      )}

      {/* KYC Detail Modal */}
      <Modal isOpen={!!selectedKyc} onClose={() => { setSelectedKyc(null); setShowRejectInput(false); }} title="KYC Details" size="lg">
        {selectedKyc && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900 text-lg">{selectedKyc.user.fullName}</p>
                <p className="text-sm text-slate-500">{selectedKyc.user.email}</p>
              </div>
              <Badge variant={selectedKyc.status === 'APPROVED' ? 'approved' : selectedKyc.status === 'REJECTED' ? 'rejected' : 'pending'}>
                {selectedKyc.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Full Name</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.fullName}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Address</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.address}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">UPI ID</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.upiId}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Bank Account</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.bankAccount}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">IFSC Code</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.ifscCode}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Aadhaar Number</p><p className="text-sm text-slate-900 mt-1">{selectedKyc.aadhaarNumber}</p></div>
              <div><p className="text-xs text-slate-400 uppercase font-semibold">Submitted</p><p className="text-sm text-slate-900 mt-1">{new Date(selectedKyc.submittedAt).toLocaleString('en-IN')}</p></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Selfie</p>
                <div className="relative group cursor-pointer" onClick={() => setImageModal({ open: true, url: selectedKyc.selfieUrl, title: 'KYC Selfie' })}>
                  <img src={selectedKyc.selfieUrl} alt="KYC Selfie" className="w-full h-48 rounded-xl object-cover border-2 border-slate-100 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                    <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Aadhaar Card</p>
                <div className="relative group cursor-pointer" onClick={() => setImageModal({ open: true, url: selectedKyc.aadhaarPhotoUrl, title: 'KYC Aadhaar Card' })}>
                  <img src={selectedKyc.aadhaarPhotoUrl} alt="KYC Aadhaar Card" className="w-full h-48 rounded-xl object-contain border-2 border-slate-100 bg-slate-50 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                    <svg className="w-8 h-8 text-slate-700 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {selectedKyc.status === 'PENDING' && (
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                {showRejectInput ? (
                  <div className="space-y-3">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => handleReject(selectedKyc.id)} disabled={actionLoading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                        {actionLoading && <Spinner size="sm" />}
                        Confirm Reject
                      </button>
                      <button onClick={() => setShowRejectInput(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(selectedKyc.id)} disabled={actionLoading} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                      {actionLoading && <Spinner size="sm" />}
                      Approve
                    </button>
                    <button onClick={() => setShowRejectInput(true)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Fullscreen Image Viewer */}
      <ScreenshotModal
        isOpen={imageModal.open}
        onClose={() => setImageModal({ open: false, url: '', title: '' })}
        imageUrl={imageModal.url}
        title={imageModal.title}
      />
    </div>
  );
}
