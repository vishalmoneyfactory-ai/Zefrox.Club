'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

interface User {
  kycStatus: string | null;
}

export default function DepositPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [amount, setAmount] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/api/users/me');
        setUser(data);
      } catch {
        showError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showError]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Screenshot must be under 10MB');
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    if (!screenshotFile) {
      showError('Please upload a screenshot of your payment');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('amount', amount);
      data.append('screenshot', screenshotFile);

      await fetch('/api/payments/direct', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      showSuccess('Payment submitted successfully! Waiting for admin approval.');
      router.push('/dashboard');
    } catch {
      showError('Failed to submit payment. Please try again.');
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

  if (user?.kycStatus !== 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-fade-in text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">KYC Verification Required</h2>
          <p className="text-slate-500 mb-6">
            You must complete your KYC and have it approved by an admin before you can make payments.
          </p>
          <button
            onClick={() => router.push('/kyc')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to KYC Verification
          </button>
        </div>
      </div>
    );
  }

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'express.fx@pytes';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Make a Payment</h1>
        <p className="text-slate-500 mt-1">Scan the QR code below to deposit funds into your account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-slate-50 p-6 border-b border-slate-200 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Scan & Pay</h2>
          <div className="inline-block bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
            <img 
              src="/images/admin-qr.jpg" 
              alt="Admin Payment QR Code" 
              className="w-48 h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23f1f5f9" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" fill="%2394a3b8">QR Code Missing</text></svg>';
              }}
            />
          </div>
          <p className="text-sm text-slate-500 mb-1">Or transfer directly to UPI ID:</p>
          <p className="font-mono font-semibold text-lg text-slate-900">{upiId}</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount Transferred (₹) *
              </label>
              <input
                id="amount"
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder="e.g. 5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Upload Payment Screenshot *
              </label>
              <div
                onClick={() => screenshotInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors h-full flex flex-col justify-center"
              >
                {screenshotPreview ? (
                  <div className="space-y-3">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="max-h-48 rounded-xl object-contain mx-auto border border-slate-200 shadow-sm"
                    />
                    <p className="text-sm text-blue-600 font-medium">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-slate-500 text-sm font-medium">Upload payment proof</p>
                    <p className="text-slate-400 text-xs mt-1">JPG or PNG (max 10MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleScreenshotChange}
                className="hidden"
              />
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
                  Uploading...
                </>
              ) : (
                'Submit Payment Proof'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
