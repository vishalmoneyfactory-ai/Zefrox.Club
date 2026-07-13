'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  plan: string;
  onSuccess: () => void;
}

type WithdrawalStep = 'AMOUNT' | 'METHOD_AND_DETAILS' | 'CONFIRM';
type WithdrawalMethod = 'Bank Transfer' | 'UPI Transfer';

export default function WithdrawalModal({ isOpen, onClose, accountId, plan, onSuccess }: WithdrawalModalProps) {
  const [step, setStep] = useState<WithdrawalStep>('AMOUNT');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod | null>(null);
  
  // Bank details
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  // UPI details
  const [upiId, setUpiId] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const resetState = () => {
    setStep('AMOUNT');
    setAmount('');
    setMethod(null);
    setAccountNumber('');
    setBankName('');
    setIfscCode('');
    setUpiId('');
    setAgreed(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 1000) {
      showError('Withdrawal amount must be more than ₹1000');
      return;
    }
    setStep('METHOD_AND_DETAILS');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) {
      showError('Please select a withdrawal method');
      return;
    }
    if (method === 'Bank Transfer') {
      if (!accountNumber || !bankName || !ifscCode) {
        showError('Please fill in all bank details');
        return;
      }
    } else if (method === 'UPI Transfer') {
      if (!upiId) {
        showError('Please enter your UPI ID');
        return;
      }
    }
    setStep('CONFIRM');
  };

  const handleSubmit = async () => {
    if (!agreed) {
      showError('Please agree to the terms and conditions');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/api/withdrawals', {
        accountId,
        amount: Number(amount),
        method,
        bankAccount: accountNumber,
        bankName,
        ifscCode,
        upiId,
      });
      showSuccess('Withdrawal request submitted successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
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
        className="relative w-full max-w-lg bg-[#0b1221] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111827] shrink-0">
          <h2 className="text-xl font-bold text-white">
            Withdrawal will be in {
              plan?.toLowerCase().includes('platinum +') ? '5-10 min' :
              plan?.toLowerCase().includes('platinum') ? '30-40 min' :
              plan?.toLowerCase().includes('premium') ? '1-2 hrs' :
              '2-3 hrs'
            }
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center mb-6">
            <p className="text-sm text-amber-200/80 leading-relaxed font-medium">
              This balance will be updated after withdrawal and deposit request<br />
              For 2 minute instant withdrawal please take MT5/ odd-hub amount<br />
              <span className="text-amber-400 font-bold mt-2 block">Note: If you want full withdrawal, please email us for closing the account.</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'AMOUNT' && (
              <motion.form
                key="amount"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleAmountSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Withdrawal Amount (₹) 
                    {amount && !isNaN(Number(amount)) && (
                      <span className="text-blue-400 ml-2">
                        (~${(Number(amount) / 97).toFixed(2)})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    min="1001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter amount (More than ₹1000)"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full shadow-lg shadow-blue-500/20">
                  Continue
                </Button>
              </motion.form>
            )}

            {step === 'METHOD_AND_DETAILS' && (
              <motion.form
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleDetailsSubmit}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-white font-semibold mb-3">Select Withdrawal Method</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setMethod('Bank Transfer')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        method === 'Bank Transfer'
                          ? 'bg-blue-500/10 border-blue-500'
                          : 'bg-[#111827]/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === 'Bank Transfer' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#060a14] text-slate-400'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${method === 'Bank Transfer' ? 'text-white' : 'text-slate-300'}`}>Bank Transfer</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Direct bank transfer (1-3 business days)</p>
                        </div>
                      </div>
                      {method === 'Bank Transfer' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('UPI Transfer')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        method === 'UPI Transfer'
                          ? 'bg-emerald-500/10 border-emerald-500'
                          : 'bg-[#111827]/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === 'UPI Transfer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#060a14] text-slate-400'}`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${method === 'UPI Transfer' ? 'text-white' : 'text-slate-300'}`}>UPI Transfer</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Instant UPI transfer</p>
                        </div>
                      </div>
                      {method === 'UPI Transfer' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                {method === 'Bank Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-white font-semibold text-sm">Bank Account Details</h3>
                    <div>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </motion.div>
                )}

                {method === 'UPI Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-white font-semibold text-sm">UPI Details</h3>
                    <div>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-[#111827]/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Enter UPI ID (e.g., user@paytm)"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2 border-t border-white/5 mt-6">
                  <Button type="button" variant="ghost" className="flex-1 border border-white/10" onClick={() => setStep('AMOUNT')}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 shadow-lg shadow-blue-500/20" disabled={!method}>
                    Continue
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 'CONFIRM' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-white font-semibold">Confirm Withdrawal</h3>
                
                <div className="bg-[#111827]/80 rounded-xl p-5 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-teal-400 font-bold text-lg">
                      ₹{amount} <span className="text-sm text-teal-500/70">(${(Number(amount) / 97).toFixed(2)})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Method:</span>
                    <span className="text-white font-semibold">{method}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Processing Time:</span>
                    <span className="text-white font-semibold">{method === 'UPI Transfer' ? 'Instant' : '1-3 business days'}</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-amber-500 mb-1">Important:</p>
                    <ul className="list-disc pl-4 text-amber-200/80 space-y-1">
                      <li>Withdrawal requests are subject to admin approval</li>
                      <li>Processing time may vary based on bank/UPI provider</li>
                      <li>Incorrect account details may cause delays</li>
                    </ul>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)} 
                    />
                    <div className="w-5 h-5 border-2 border-slate-500 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    I agree to the terms and conditions and confirm that the provided account details are correct.
                  </span>
                </label>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <Button type="button" variant="ghost" className="flex-1 border border-white/10" onClick={() => setStep('METHOD_AND_DETAILS')} disabled={loading}>
                    Back
                  </Button>
                  <Button type="button" variant="primary" className="flex-1 shadow-lg shadow-blue-500/20" onClick={handleSubmit} loading={loading} disabled={!agreed}>
                    Submit Request
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
