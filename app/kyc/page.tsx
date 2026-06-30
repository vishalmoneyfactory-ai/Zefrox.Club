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
        <Spinner size="lg" className="text-aurora-cyan" />
      </div>
    );
  }

  // Show pending status
  if (kycData?.status === 'PENDING') {
    return (
      <div className="max-w-lg mx-auto mt-12 relative z-10">
        <div className="absolute inset-0 -z-10 bg-yellow-500/10 rounded-full blur-[100px]" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card glass glow className="text-center p-10 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 mb-6 border border-yellow-500/30">
              <ShieldAlert className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">KYC Under Review</h2>
            <p className="text-slate-400 mb-8 font-medium">
              Your identity verification is currently being reviewed by our admin team.
              You&apos;ll receive a notification once it&apos;s processed.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm font-bold shadow-inner">
              <Spinner size="sm" className="text-yellow-400" />
              Processing Request...
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show approved status
  if (kycData?.status === 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto mt-12 relative z-10">
        <div className="absolute inset-0 -z-10 bg-green-500/10 rounded-full blur-[100px]" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card glass glow className="p-8 sm:p-12 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/30">
                <ShieldCheck className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Identity Verified</h2>
              <p className="text-slate-400 font-medium">
                Your KYC is complete. You have full access to trading capabilities.
              </p>
            </div>
            
            <div className="space-y-6 border-t border-white/10 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Full Name</p>
                  <p className="text-white font-semibold text-lg">{kycData.fullName}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">UPI ID</p>
                  <p className="text-white font-semibold text-lg">{kycData.upiId}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Bank Account</p>
                  <p className="text-white font-semibold text-lg">{kycData.bankAccount}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Aadhaar Number</p>
                  <p className="text-white font-semibold text-lg">•••• •••• {kycData.aadhaarNumber?.slice(-4)}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto relative z-10 pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-aurora-cyan/10 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
          <Shield className="w-8 h-8 text-aurora-cyan" /> KYC Verification
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Complete your identity verification to unlock trading and payment features.</p>
      </motion.div>

      {/* Rejection banner */}
      <AnimatePresence>
        {kycData?.status === 'REJECTED' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-400 text-lg">Verification Rejected</p>
                <p className="text-red-200 text-sm mt-1">{kycData.rejectionReason}</p>
                <p className="text-slate-300 text-sm mt-3 font-medium">Please correct the highlighted issues and resubmit below.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card glass glow className="p-6 sm:p-10 border-white/5 bg-slate-900/60 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="kyc-fullName" className="text-sm font-semibold text-slate-300 ml-1">Full Legal Name *</label>
                  <input
                    id="kyc-fullName"
                    type="text"
                    {...register('fullName')}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.fullName ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="As per documents"
                  />
                  {errors.fullName && <p className="text-red-400 text-xs ml-1 mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="kyc-address" className="text-sm font-semibold text-slate-300 ml-1">Residential Address *</label>
                  <textarea
                    id="kyc-address"
                    {...register('address')}
                    rows={3}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm resize-none ${errors.address ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="Complete address details"
                  />
                  {errors.address && <p className="text-red-400 text-xs ml-1 mt-1">{errors.address.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="kyc-upiId" className="text-sm font-semibold text-slate-300 ml-1">UPI ID *</label>
                  <input
                    id="kyc-upiId"
                    type="text"
                    {...register('upiId')}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.upiId ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="name@upi"
                  />
                  {errors.upiId && <p className="text-red-400 text-xs ml-1 mt-1">{errors.upiId.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="kyc-bankAccount" className="text-sm font-semibold text-slate-300 ml-1">Bank Account Number *</label>
                  <input
                    id="kyc-bankAccount"
                    type="text"
                    {...register('bankAccount')}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.bankAccount ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="Account number"
                  />
                  {errors.bankAccount && <p className="text-red-400 text-xs ml-1 mt-1">{errors.bankAccount.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="kyc-ifscCode" className="text-sm font-semibold text-slate-300 ml-1">IFSC Code *</label>
                  <input
                    id="kyc-ifscCode"
                    type="text"
                    {...register('ifscCode')}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm uppercase ${errors.ifscCode ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="SBIN0001234"
                  />
                  {errors.ifscCode && <p className="text-red-400 text-xs ml-1 mt-1">{errors.ifscCode.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="kyc-aadhaar" className="text-sm font-semibold text-slate-300 ml-1">Aadhaar Number *</label>
                  <input
                    id="kyc-aadhaar"
                    type="text"
                    maxLength={12}
                    {...register('aadhaarNumber')}
                    className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.aadhaarNumber ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                    placeholder="12 digit Aadhaar number"
                  />
                  {errors.aadhaarNumber && <p className="text-red-400 text-xs ml-1 mt-1">{errors.aadhaarNumber.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Aadhaar Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Aadhaar Card Photo *</label>
                <div
                  onClick={() => aadhaarInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 bg-slate-950/30 rounded-2xl p-6 text-center cursor-pointer hover:border-aurora-cyan/50 hover:bg-aurora-cyan/5 transition-all duration-300 h-[200px] flex flex-col justify-center relative overflow-hidden group"
                >
                  {aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={aadhaarPhotoPreview || kycData?.aadhaarPhotoUrl}
                        alt="Aadhaar preview"
                        className="max-h-full rounded-xl object-contain z-10 relative"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-white font-bold tracking-wide">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-aurora-cyan group-hover:bg-aurora-cyan/20 transition-colors">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-bold">Upload Aadhaar photo</p>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Clear photo of Aadhaar Card</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={aadhaarInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleAadhaarPhotoChange} className="hidden" />
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Selfie Photo *</label>
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 bg-slate-950/30 rounded-2xl p-6 text-center cursor-pointer hover:border-aurora-cyan/50 hover:bg-aurora-cyan/5 transition-all duration-300 h-[200px] flex flex-col justify-center relative overflow-hidden group"
                >
                  {selfiePreview || kycData?.selfieUrl ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={selfiePreview || kycData?.selfieUrl}
                        alt="Selfie preview"
                        className="max-h-full aspect-square rounded-xl object-cover z-10 relative border border-white/10"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <p className="text-sm text-white font-bold tracking-wide">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-aurora-cyan group-hover:bg-aurora-cyan/20 transition-colors">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-bold">Upload selfie photo</p>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Clear face photo (max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={selfieInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleSelfieChange} className="hidden" />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full"
                loading={submitting}
              >
                {kycData?.status === 'REJECTED' ? 'Resubmit Verification' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
