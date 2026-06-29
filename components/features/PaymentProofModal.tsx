'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ScreenshotModal from '@/components/features/ScreenshotModal';

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
        <div className="bg-slate-50 rounded-lg p-5 space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Scan to Pay</h3>
            <p className="text-xs text-slate-500 mb-3">Scan this QR code with any UPI app</p>
            <div className="bg-white p-2 rounded-xl inline-block shadow-sm border border-slate-100 mb-2">
              <div className="relative group cursor-pointer" onClick={() => setImageModal(true)}>
                <img src="/images/admin-qr.jpeg" alt="Admin QR Code" className="w-40 h-40 object-cover rounded-lg group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
                  <svg className="w-8 h-8 text-slate-700 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">UPI Details</p>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-slate-500">UPI ID</span>
                <span className="text-sm font-medium text-slate-900 font-mono">{upiId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Account Name</span>
                <span className="text-sm font-medium text-slate-900">Company</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bank Details</p>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-slate-500">A/C Number</span>
                <span className="text-sm font-medium text-slate-900 font-mono">XXXX-XXXX-1234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">IFSC Code</span>
                <span className="text-sm font-medium text-slate-900 font-mono">SBIN0001234</span>
              </div>
            </div>
          </div>
        </div>

        {/* File upload section */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Payment Screenshot
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="proof-upload"
            />
            <label htmlFor="proof-upload" className="cursor-pointer">
              <svg
                className="h-10 w-10 text-slate-400 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm text-slate-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, JPEG up to 10MB
              </p>
            </label>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <img
              src={preview}
              alt="Payment screenshot preview"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          loading={uploading}
          disabled={!file}
          className="w-full"
        >
          Upload Proof
        </Button>
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
