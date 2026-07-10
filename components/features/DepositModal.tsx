'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess: () => void;
}

type PaymentMethod = 'NET_BANKING' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'ADMIN_QR';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
  { id: 'CARD', label: 'Debit/Credit Card', icon: '💳' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)', icon: '💸' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
  { id: 'ADMIN_QR', label: 'Manual Admin QR', icon: '📷' }
];

export default function DepositModal({ isOpen, onClose, accountId, onSuccess }: DepositModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleMethodSelect = (method: PaymentMethod) => {
    if (['NET_BANKING', 'CARD', 'BANK_TRANSFER'].includes(method)) {
      showError('Your bank does not support this method.');
      return;
    }
    setSelectedMethod(method);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showError('Please upload a payment screenshot');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('accountId', accountId);
    formData.append('amount', amount);
    formData.append('screenshot', file);

    try {
      await api.post('/api/payments/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess('Deposit proof uploaded successfully! Awaiting admin approval.');
      onSuccess();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSelectedMethod(null);
    setAmount('');
    setFile(null);
    setPreview('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#060a14]/90 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0b1221] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111827]">
          <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!selectedMethod ? (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">Select a payment method to proceed:</p>
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full flex items-center p-4 bg-[#111827]/60 border border-white/5 rounded-xl hover:bg-[#111827] hover:border-blue-500/50 transition-all group"
                >
                  <span className="text-2xl mr-4">{method.icon}</span>
                  <span className="text-slate-200 font-semibold group-hover:text-blue-400 transition-colors">
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-100">
                  <p className="font-semibold mb-1">Manual Deposit Instructions</p>
                  <p className="text-slate-300">
                    Please send the exact amount to the details below, then upload a screenshot of your successful transaction.
                  </p>
                  <div className="mt-3 p-3 bg-[#060a14]/50 rounded-lg font-mono text-sm border border-white/5 flex flex-col items-center">
                    {selectedMethod === 'ADMIN_QR' || selectedMethod === 'UPI' ? (
                      <div className="flex flex-col items-center">
                        <img src="/images/admin-qr.jpeg" alt="QR Code" className="w-48 h-48 rounded-lg mb-2 object-contain bg-white p-2" />
                        <span className="text-slate-400 font-bold mt-2">Scan to pay via UPI</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Amount to Deposit (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Payment Screenshot</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                    preview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-[#111827]/40 hover:border-blue-500/50 hover:bg-blue-500/5'
                  }`}>
                    {preview ? (
                      <div className="flex flex-col items-center text-emerald-400">
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Screenshot Selected</span>
                        <span className="text-xs text-slate-400 mt-1">{file?.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <Upload className="w-8 h-8 mb-3 text-slate-500" />
                        <span className="text-sm font-medium">Click or drag image here</span>
                        <span className="text-xs mt-1 opacity-70">JPG, PNG up to 10MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1 border border-white/10" onClick={() => setSelectedMethod(null)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1 shadow-lg shadow-blue-500/20" loading={loading}>
                  Submit Proof
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
