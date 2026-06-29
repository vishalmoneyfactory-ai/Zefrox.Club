'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

const kycSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  upiId: z.string().min(3, 'Enter a valid UPI ID'),
  bankAccount: z.string().min(8, 'Enter a valid bank account number'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code (e.g., SBIN0001234)'),
  aadhaarNumber: z.string().min(12, 'Aadhaar number must be exactly 12 digits').max(12, 'Aadhaar number must be exactly 12 digits'),
});

type KycForm = z.infer<typeof kycSchema>;

interface KycData {
  id: string;
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
}

export default function KycPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [aadhaarPhotoFile, setAadhaarPhotoFile] = useState<File | null>(null);
  const [aadhaarPhotoPreview, setAadhaarPhotoPreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
  });

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const { data } = await api.get('/api/kyc');
        if (data) {
          setKycData(data);
          if (data.status === 'APPROVED') {
            // We do not redirect, we let the UI show the Approved state
          }
          if (data.status === 'REJECTED') {
            reset({
              fullName: data.fullName,
              address: data.address,
              upiId: data.upiId,
              bankAccount: data.bankAccount,
              ifscCode: data.ifscCode,
              aadhaarNumber: data.aadhaarNumber || '',
            });
          }
        }
      } catch {
        // No KYC record yet — show form
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, [router, reset]);

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Selfie must be under 5MB');
      return;
    }

    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelfiePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAadhaarPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Aadhaar photo must be under 5MB');
      return;
    }

    setAadhaarPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setAadhaarPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (formData: KycForm) => {
    if (!selfieFile && !kycData?.selfieUrl) {
      showError('Please upload a selfie photo');
      return;
    }
    if (!aadhaarPhotoFile && !kycData?.aadhaarPhotoUrl) {
      showError('Please upload your Aadhaar Card photo');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('address', formData.address);
      data.append('upiId', formData.upiId);
      data.append('bankAccount', formData.bankAccount);
      data.append('ifscCode', formData.ifscCode);
      data.append('aadhaarNumber', formData.aadhaarNumber);
      
      if (selfieFile) {
        data.append('selfie', selfieFile);
      }
      if (aadhaarPhotoFile) {
        data.append('aadhaarPhoto', aadhaarPhotoFile);
      }

      await fetch('/api/kyc', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      showSuccess('KYC submitted successfully! We will review it shortly.');
      setKycData((prev) => prev ? { ...prev, status: 'PENDING', rejectionReason: undefined } : null);
      // Refresh to show pending state
      const { data: updatedKyc } = await api.get('/api/kyc');
      setKycData(updatedKyc);
    } catch {
      showError('Failed to submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show pending status
  if (kycData?.status === 'PENDING') {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 mb-6">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">KYC Under Review</h2>
          <p className="text-slate-500 mb-6">
            Your KYC verification is currently being reviewed by our admin team.
            You&apos;ll receive a notification once it&apos;s processed.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm font-medium">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </div>
        </div>
      </div>
    );
  }

  // Show approved status
  if (kycData?.status === 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">KYC Approved</h2>
            <p className="text-slate-500">
              Your identity verification is complete. You can now make payments.
            </p>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-slate-900 font-semibold">{kycData.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">UPI ID</p>
                <p className="text-slate-900 font-semibold">{kycData.upiId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Bank Account</p>
                <p className="text-slate-900 font-semibold">{kycData.bankAccount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Aadhaar Number</p>
                <p className="text-slate-900 font-semibold">XXXXXXXX{kycData.aadhaarNumber?.slice(-4)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>
        <p className="text-slate-500 mt-1">Complete your identity verification to unlock payment features</p>
      </div>

      {/* Rejection banner */}
      {kycData?.status === 'REJECTED' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">KYC Rejected</p>
              <p className="text-red-700 text-sm mt-1">{kycData.rejectionReason}</p>
              <p className="text-red-600 text-sm mt-2">Please correct the issues and resubmit below.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="kyc-fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                id="kyc-fullName"
                type="text"
                {...register('fullName')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="Full name as per documents"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="kyc-address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Address *
              </label>
              <textarea
                id="kyc-address"
                {...register('address')}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none`}
                placeholder="Complete residential address"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address.message}</p>}
            </div>

            <div>
              <label htmlFor="kyc-upiId" className="block text-sm font-medium text-slate-700 mb-1.5">
                UPI ID *
              </label>
              <input
                id="kyc-upiId"
                type="text"
                {...register('upiId')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.upiId ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="name@upi"
              />
              {errors.upiId && <p className="text-red-500 text-xs mt-1.5">{errors.upiId.message}</p>}
            </div>

            <div>
              <label htmlFor="kyc-bankAccount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Bank Account Number *
              </label>
              <input
                id="kyc-bankAccount"
                type="text"
                {...register('bankAccount')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.bankAccount ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="Account number"
              />
              {errors.bankAccount && <p className="text-red-500 text-xs mt-1.5">{errors.bankAccount.message}</p>}
            </div>

            <div>
              <label htmlFor="kyc-ifscCode" className="block text-sm font-medium text-slate-700 mb-1.5">
                IFSC Code *
              </label>
              <input
                id="kyc-ifscCode"
                type="text"
                {...register('ifscCode')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.ifscCode ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm uppercase`}
                placeholder="SBIN0001234"
              />
              {errors.ifscCode && <p className="text-red-500 text-xs mt-1.5">{errors.ifscCode.message}</p>}
            </div>

            <div>
              <label htmlFor="kyc-aadhaar" className="block text-sm font-medium text-slate-700 mb-1.5">
                Aadhaar Number *
              </label>
              <input
                id="kyc-aadhaar"
                type="text"
                maxLength={12}
                {...register('aadhaarNumber')}
                className={`w-full px-4 py-3 rounded-xl border ${errors.aadhaarNumber ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                placeholder="12 digit Aadhaar number"
              />
              {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1.5">{errors.aadhaarNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Aadhaar Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Aadhaar Card Photo *
              </label>
              <div
                onClick={() => aadhaarInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors h-full flex flex-col justify-center"
              >
                {aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl ? (
                  <div className="space-y-3">
                    <img
                      src={aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl}
                      alt="Aadhaar preview"
                      className="w-full h-32 rounded-xl object-contain mx-auto border-2 border-slate-200 bg-slate-50"
                    />
                    <p className="text-sm text-blue-600 font-medium">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                    <p className="text-slate-500 text-sm font-medium">Upload Aadhaar photo</p>
                    <p className="text-slate-400 text-xs mt-1">Clear photo of Aadhaar Card</p>
                  </div>
                )}
              </div>
              <input
                ref={aadhaarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleAadhaarPhotoChange}
                className="hidden"
              />
            </div>

          {/* Selfie Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Selfie Photo *
            </label>
            <div
              onClick={() => selfieInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors h-full flex flex-col justify-center"
            >
              {selfiePreview || kycData?.selfieUrl ? (
                <div className="space-y-3">
                  <img
                    src={selfiePreview || kycData?.selfieUrl}
                    alt="Selfie preview"
                    className="w-32 h-32 rounded-xl object-cover mx-auto border-2 border-slate-200"
                  />
                  <p className="text-sm text-blue-600 font-medium">Click to change</p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <p className="text-slate-500 text-sm font-medium">Upload selfie photo</p>
                  <p className="text-slate-400 text-xs mt-1">JPG, JPEG, or PNG (max 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleSelfieChange}
              className="hidden"
            />
          </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : kycData?.status === 'REJECTED' ? (
              'Resubmit KYC'
            ) : (
              'Submit KYC'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
