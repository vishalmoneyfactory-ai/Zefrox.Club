'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import { UploadCloud, Info } from 'lucide-react';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRequestId: string;
  amount: number;
  onSuccess: () => void;
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  paymentRequestId,
  amount,
  onSuccess,
}: PaymentProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'company@upi';

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setError(null);
      setUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a payment screenshot.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('paymentRequestId', paymentRequestId);
      formData.append('screenshot', file);

      const res = await fetch('/api/payments/upload-proof', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Upload failed');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload proof. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Payment Proof" size="md">
      <div className="space-y-6">
        {/* Payment details section */}
        <div className="bg-[#111827]/60 border border-white/5 rounded-[1.5rem] p-6 space-y-5 shadow-inner">
          <div className="text-center">
            <h3 className="text-base font-bold text-white mb-1">Scan to Pay</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Scan this QR code with any UPI app</p>
            <div className="bg-white p-2.5 rounded-[1.5rem] inline-block shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4">
              <div className="relative group cursor-pointer" onClick={() => setImageModal(true)}>
                <img src="/images/admin-qr.jpeg" alt="Admin QR Code" className="w-40 h-40 object-cover rounded-xl group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                  <svg className="w-8 h-8 text-slate-700 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Requested Amount</p>
              <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5 space-y-4">
            <div className="bg-[#060a14]/60 rounded-2xl border border-white/5 p-4 shadow-sm hover:border-white/10 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">UPI Details</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-400">UPI ID</span>
                <span className="text-sm font-bold text-white font-mono">{upiId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-400">Account Name</span>
                <span className="text-sm font-bold text-white">Company</span>
              </div>
            </div>

            <div className="bg-[#060a14]/60 rounded-2xl border border-white/5 p-4 shadow-sm hover:border-white/10 transition-colors">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Bank Details</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-400">A/C Number</span>
                <span className="text-sm font-bold text-white font-mono">XXXX-XXXX-1234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-400">IFSC Code</span>
                <span className="text-sm font-bold text-white font-mono">SBIN0001234</span>
              </div>
            </div>
          </div>
        </div>

        {/* File upload section */}
        <div>
          <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider mb-2 block">
            Upload Payment Screenshot *
          </label>
          <div className="border-2 border-dashed border-white/20 bg-[#111827]/40 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 relative overflow-hidden group shadow-inner">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="proof-upload"
            />
            <div className="relative z-0 space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-all shadow-inner">
                 <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-white text-base font-bold">Click to upload or drag & drop</p>
                 <p className="text-slate-400 text-xs mt-1 font-medium">PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg relative group">
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-[#060a14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none">
                <p className="text-sm text-white font-bold tracking-widest uppercase">Screenshot Preview</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-center shadow-inner">
            <Info className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            loading={uploading}
            disabled={!file}
            variant="primary"
            size="lg"
            className="w-full shadow-[0_0_20px_rgba(37,99,235,0.4)] h-14 rounded-2xl text-lg"
          >
            Submit Proof for Review
          </Button>
        </div>
      </div>
    </Modal>
    
    <ScreenshotModal
      isOpen={imageModal}
      onClose={() => setImageModal(false)}
      imageUrl="/images/admin-qr.jpeg"
      title="Admin QR Code"
    />
    </>
  );
}
