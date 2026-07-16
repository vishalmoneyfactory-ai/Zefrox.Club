'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, UploadCloud, ShieldCheck, Shield } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const kycSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().optional(),
  upiId: z.string().min(3, 'Enter a valid UPI ID'),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
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
        // No KYC record yet
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
      data.append('address', formData.address || '');
      data.append('upiId', formData.upiId);
      data.append('bankAccount', formData.bankAccount || '');
      data.append('ifscCode', formData.ifscCode || '');
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
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  // Show pending status
  if (kycData?.status === 'PENDING') {
    return (
      <div className="max-w-xl mx-auto mt-12 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-center p-12 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-100 mb-8 border border-amber-200 shadow-inner">
              <ShieldAlert className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black text-amber-700 mb-4">KYC Under Review</h2>
            <p className="text-amber-600 mb-10 font-medium text-lg max-w-sm mx-auto">
              Your identity verification is currently being reviewed by our admin team.
              You&apos;ll receive a notification once it&apos;s processed.
            </p>
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-amber-100 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold">
              <Spinner size="md" className="text-amber-500" />
              Processing Request...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show approved status
  if (kycData?.status === 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto mt-12 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="p-8 sm:p-12 bg-emerald-50/80 border border-emerald-200 rounded-2xl shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-100 mb-6 border border-emerald-200 shadow-inner">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-black text-emerald-700 mb-4">Identity Verified</h2>
              <p className="text-emerald-600 font-medium text-lg">
                Your KYC is complete. You have full access to trading capabilities.
              </p>
            </div>
            
            <div className="border-t border-emerald-200 pt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Full Name</p>
                  <p className="text-slate-800 font-black text-xl">{kycData.fullName}</p>
                </div>
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">UPI ID</p>
                  <p className="text-slate-800 font-bold text-lg">{kycData.upiId}</p>
                </div>
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Bank Account</p>
                  <p className="text-slate-800 font-bold text-lg">{kycData.bankAccount}</p>
                </div>
                <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Aadhaar Number</p>
                  <p className="text-slate-800 font-mono font-bold text-lg">•••• •••• {kycData.aadhaarNumber?.slice(-4)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto relative z-10 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 border border-indigo-200 rounded-2xl shadow-inner">
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          KYC Verification
        </h1>
        <p className="text-slate-500 mt-4 text-lg font-medium">Complete your identity verification to unlock trading and payment features.</p>
      </motion.div>

      {/* Rejection banner */}
      <AnimatePresence>
        {kycData?.status === 'REJECTED' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <div className="p-6 bg-red-50/80 border border-red-200 rounded-2xl flex gap-5 items-start">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
              </div>
              <div>
                <p className="font-black text-red-700 text-xl mb-1">Verification Rejected</p>
                <p className="text-red-600 text-base font-medium">{kycData.rejectionReason}</p>
                <p className="text-slate-600 text-sm mt-4 font-semibold">Please correct the highlighted issues and resubmit below.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white/90 backdrop-blur-xl border border-white/70 shadow-xl rounded-2xl p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2 space-y-2">
                  <label htmlFor="kyc-fullName" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Full Legal Name *</label>
                  <input
                    id="kyc-fullName"
                    type="text"
                    {...register('fullName')}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base ${errors.fullName ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="As per documents"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.fullName.message}</p>}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label htmlFor="kyc-address" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Residential Address (Optional)</label>
                  <textarea
                    id="kyc-address"
                    {...register('address')}
                    rows={3}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base resize-none ${errors.address ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="Complete address details"
                  />
                  {errors.address && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="kyc-upiId" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">UPI ID *</label>
                  <input
                    id="kyc-upiId"
                    type="text"
                    {...register('upiId')}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base ${errors.upiId ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="name@upi"
                  />
                  {errors.upiId && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.upiId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="kyc-bankAccount" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Bank Account Number (Optional)</label>
                  <input
                    id="kyc-bankAccount"
                    type="text"
                    {...register('bankAccount')}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base ${errors.bankAccount ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="Account number"
                  />
                  {errors.bankAccount && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.bankAccount.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="kyc-ifscCode" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">IFSC Code (Optional)</label>
                  <input
                    id="kyc-ifscCode"
                    type="text"
                    {...register('ifscCode')}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base uppercase ${errors.ifscCode ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="SBIN0001234"
                  />
                  {errors.ifscCode && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.ifscCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="kyc-aadhaar" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Aadhaar Number *</label>
                  <input
                    id="kyc-aadhaar"
                    type="text"
                    maxLength={12}
                    {...register('aadhaarNumber')}
                    className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-base ${errors.aadhaarNumber ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                    placeholder="12 digit Aadhaar number"
                  />
                  {errors.aadhaarNumber && <p className="text-red-500 text-xs ml-1 mt-1.5 font-medium">{errors.aadhaarNumber.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Aadhaar Photo Upload */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Aadhaar Card Photo *</label>
                <div
                  onClick={() => aadhaarInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 h-[220px] flex flex-col justify-center relative overflow-hidden group"
                >
                  {aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl}
                        alt="Aadhaar preview"
                        className="max-h-full rounded-xl object-contain z-10 relative"
                      />
                      <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-slate-700 font-bold tracking-widest uppercase">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-400 group-hover:text-indigo-500 group-hover:bg-indigo-100/80 transition-all shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-slate-700 text-base font-bold">Upload Aadhaar photo</p>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Clear photo of Aadhaar Card</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={aadhaarInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleAadhaarPhotoChange} className="hidden" />
              </div>

              {/* Selfie Upload */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Selfie Photo *</label>
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 h-[220px] flex flex-col justify-center relative overflow-hidden group"
                >
                  {selfiePreview || kycData?.selfieUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={selfiePreview || kycData?.selfieUrl}
                        alt="Selfie preview"
                        className="max-h-full aspect-square rounded-xl object-cover z-10 relative border border-slate-200"
                      />
                      <div className="absolute inset-0 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-slate-700 font-bold tracking-widest uppercase">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-400 group-hover:text-indigo-500 group-hover:bg-indigo-100/80 transition-all shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-slate-700 text-base font-bold">Upload selfie photo</p>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Clear face photo (max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={selfieInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleSelfieChange} className="hidden" />
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-lg h-14 rounded-2xl"
                loading={submitting}
              >
                {kycData?.status === 'REJECTED' ? 'Resubmit Verification' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
