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
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white/95 border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(99,102,241,0.18)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white shrink-0 mt-1">
          <h2 className="text-xl font-bold text-slate-800">
            Withdrawal will be in {
              plan?.toLowerCase().includes('platinum +') ? '5-10 min' :
              plan?.toLowerCase().includes('platinum') ? '30-40 min' :
              plan?.toLowerCase().includes('premium') ? '1-2 hrs' :
              '2-3 hrs'
            }
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center mb-6">
            <p className="text-sm text-amber-700 leading-relaxed font-medium">
              This balance will be updated after withdrawal and deposit request<br />
              For 2 minute instant withdrawal please take MT5/ odd-hub amount<br />
              <span className="text-amber-700 font-bold mt-2 block">Note: If you want full withdrawal, please email us for closing the account.</span>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Withdrawal Amount (₹) 
                    {amount && !isNaN(Number(amount)) && (
                      <span className="text-indigo-500 ml-2">
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
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                    placeholder="Enter amount (More than ₹1000)"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.55)] border-0">
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
                  <h3 className="text-slate-800 font-semibold mb-3">Select Withdrawal Method</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setMethod('Bank Transfer')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        method === 'Bank Transfer'
                          ? 'bg-indigo-50 border-indigo-400 text-slate-800'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === 'Bank Transfer' ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${method === 'Bank Transfer' ? 'text-slate-800' : 'text-slate-700'}`}>Bank Transfer</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Direct bank transfer (1-3 business days)</p>
                        </div>
                      </div>
                      {method === 'Bank Transfer' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('UPI Transfer')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        method === 'UPI Transfer'
                          ? 'bg-emerald-50 border-emerald-400 text-slate-800'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === 'UPI Transfer' ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${method === 'UPI Transfer' ? 'text-slate-800' : 'text-slate-700'}`}>UPI Transfer</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Instant UPI transfer</p>
                        </div>
                      </div>
                      {method === 'UPI Transfer' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </button>
                  </div>
                </div>

                {method === 'Bank Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-slate-700 font-semibold text-sm">Bank Account Details</h3>
                    <div>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </motion.div>
                )}

                {method === 'UPI Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-slate-700 font-semibold text-sm">UPI Details</h3>
                    <div>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                        placeholder="Enter UPI ID (e.g., user@paytm)"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2 border-t border-slate-100 mt-6">
                  <Button type="button" variant="ghost" className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setStep('AMOUNT')}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 shadow-[0_4px_14px_rgba(99,102,241,0.4)]" disabled={!method}>
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
                <h3 className="text-slate-800 font-semibold">Confirm Withdrawal</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Amount:</span>
                    <span className="text-indigo-600 font-bold text-lg">
                      ₹{amount} <span className="text-sm text-indigo-400/70">(${(Number(amount) / 97).toFixed(2)})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Method:</span>
                    <span className="text-slate-800 font-semibold">{method}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Processing Time:</span>
                    <span className="text-slate-800 font-semibold">{method === 'UPI Transfer' ? 'Instant' : '1-3 business days'}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-amber-700 mb-1">Important:</p>
                    <ul className="list-disc pl-4 text-amber-700 space-y-1">
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
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                    I agree to the terms and conditions and confirm that the provided account details are correct.
                  </span>
                </label>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="ghost" className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setStep('METHOD_AND_DETAILS')} disabled={loading}>
                    Back
                  </Button>
                  <Button type="button" variant="primary" className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 shadow-[0_4px_14px_rgba(99,102,241,0.4)]" onClick={handleSubmit} loading={loading} disabled={!agreed}>
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
