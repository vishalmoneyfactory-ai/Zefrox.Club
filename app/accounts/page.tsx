'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, EyeOff, Check, X, Shield, History } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import DepositModal from '@/components/features/DepositModal';
import Link from 'next/link';

interface TradingAccount {
  id: string;
  type: 'LIVE' | 'DEMO';
  plan: string;
  balance: number;
  equity: number;
  margin: number;
  mt5Id: string;
  mt5Password: string;
  server: string;
}

const plans = [
  {
    name: 'Standard',
    deposit: '$40 (₹3600)',
    leverage: '1:500',
    description: 'Standard Account',
    iconColor: 'text-emerald-400',
  },
  {
    name: 'Platinum',
    deposit: '$100 (₹9000)',
    leverage: '1:500',
    description: 'Platinum Account',
    iconColor: 'text-indigo-400',
  },
  {
    name: 'Premium',
    deposit: '$500 (₹45000)',
    leverage: '1:500',
    description: 'Premium Account',
    iconColor: 'text-red-400',
  },
  {
    name: 'Platinum +',
    deposit: '$1000 (₹90000)',
    leverage: '1:500',
    description: 'Platinum + Account',
    iconColor: 'text-yellow-400',
  }
];

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'DEMO'>('LIVE');
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [accountPayments, setAccountPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/api/accounts');
      setAccounts(data.accounts);
    } catch (error) {
      showError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewingAccountId) {
      fetchPayments(viewingAccountId);
    }
  }, [viewingAccountId]);

  const fetchPayments = async (accountId: string) => {
    setLoadingPayments(true);
    try {
      const { data } = await api.get(`/api/payments?accountId=${accountId}`);
      setAccountPayments(data);
    } catch (error) {
      showError('Failed to load payment history');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleCreateAccount = async (planName: string) => {
    setIsCreating(true);
    try {
      await api.post('/api/accounts', { type: 'LIVE', plan: planName });
      showSuccess(`${planName} account created successfully!`);
      setShowPlans(false);
      fetchAccounts();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/accounts/${id}`);
      showSuccess('Account deleted successfully');
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeletingId(null);
      setActiveMenuId(null);
    }
  };

  const filteredAccounts = accounts.filter(acc => acc.type === activeTab);

  return (
    <div className="w-full">
      {/* Header */}
      {!viewingAccountId && (
        <div className="flex justify-center items-center mb-8 relative">
          {showPlans && (
            <button 
              onClick={() => setShowPlans(false)}
              className="absolute left-0 flex items-center gap-2 px-4 py-2 bg-[#111827]/80 rounded-lg text-sm font-semibold hover:bg-[#1f2937] transition-all"
            >
              ← Back to Accounts
            </button>
          )}
          <h1 className="text-3xl font-black tracking-tight text-white">
            {showPlans ? 'Offers' : 'Accounts'}
          </h1>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-[#0b1221]/80 rounded-xl p-1 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
              activeTab === 'LIVE' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'LIVE' && (
              <motion.div layoutId="tab" className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg" />
            )}
            <span className="relative z-10">LIVE</span>
          </button>
          <button
            onClick={() => {
              if (!showPlans) {
                setActiveTab('DEMO');
              }
            }}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
              activeTab === 'DEMO' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'DEMO' && (
              <motion.div layoutId="tab" className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg" />
            )}
            <span className="relative z-10">DEMO</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : viewingAccountId ? (
        /* Account Detail View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setViewingAccountId(null)}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-slate-300"
            >
              ←
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              VERIFIED
            </div>
          </div>

          {/* Account Detail Card */}
          <div className="bg-[#111827] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col items-center mb-8">
              <span className="text-slate-400 font-semibold mb-2">BALANCE</span>
              <h2 className="text-5xl font-black text-white mb-6">₹{accounts.find(a => a.id === viewingAccountId)?.balance.toLocaleString('en-IN') || 0}</h2>
              <div className="flex gap-6 text-sm font-semibold">
                <span className="text-slate-400">Equity: <span className="text-white">₹{accounts.find(a => a.id === viewingAccountId)?.equity || 0}</span></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Margin: <span className="text-white">₹{accounts.find(a => a.id === viewingAccountId)?.margin || 0}</span></span>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-white font-bold mb-6">MT5 Trading Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-2">MT5 ID</p>
                  <p className="text-white font-bold">{accounts.find(a => a.id === viewingAccountId)?.mt5Id || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-2">Password</p>
                  <p className="text-white font-bold">{accounts.find(a => a.id === viewingAccountId)?.mt5Password || 'Not assigned'}</p>
                  {!accounts.find(a => a.id === viewingAccountId)?.mt5Password && (
                    <p className="text-[10px] text-slate-500 mt-2">Contact admin to update your MT5 credentials</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-2">Server</p>
                  <p className="text-white font-bold">{accounts.find(a => a.id === viewingAccountId)?.server || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-8 text-sm font-semibold">
              <span className="text-slate-400">ACCOUNT: <span className="text-white">{accounts.find(a => a.id === viewingAccountId)?.plan}</span> | LEVERAGE: <span className="text-white">1:500</span></span>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setSelectedAccountId(viewingAccountId); setDepositModalOpen(true); }}
                className="px-8 py-2.5 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Deposit
              </button>
              <button className="px-8 py-2.5 border border-red-500/50 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition-all">
                Withdraw
              </button>
              <button className="px-8 py-2.5 border border-slate-600 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition-all">
                Change Password
              </button>
            </div>
          </div>

          {/* Payment History Section */}
          <div>
            <div className="flex gap-4 border-b border-white/10 mb-6">
              <button className="px-4 py-2 text-white font-bold border-b-2 border-blue-500">
                Payment History
              </button>
              <button className="px-4 py-2 text-slate-500 font-bold hover:text-slate-300 transition-colors">
                Trading History
              </button>
            </div>

            <div className="bg-[#111827] rounded-3xl p-6 border border-white/5 shadow-xl min-h-[300px]">
              {loadingPayments ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : accountPayments.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-semibold">No payment history found for this account.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountPayments.map((payment) => (
                    <div key={payment.id} className="bg-[#1f2937] rounded-xl p-5 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                          <span className="text-teal-400 text-xs font-bold tracking-wider">DEPOSIT</span>
                        </div>
                        <p className="text-slate-400 text-xs font-semibold mb-1">Amount:</p>
                        <p className="text-teal-400 font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold mb-1">Status:</p>
                        <p className={`font-bold ${payment.status === 'APPROVED' ? 'text-emerald-400' : payment.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {payment.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold mb-1">Date:</p>
                        <p className="text-white font-bold">{new Date(payment.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold mb-1">{payment.upiApp ? 'UPI App:' : 'Transaction ID:'}</p>
                        <p className="text-white font-bold truncate">{payment.upiApp || payment.transactionId}</p>
                      </div>
                      {payment.status === 'REJECTED' && payment.rejectionReason && (
                        <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-slate-400 text-xs font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-red-400 text-sm">{payment.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : showPlans ? (
        /* Plans View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {plans.map((plan, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center shadow-xl">
              <div className="flex justify-between w-full items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Live</span>
              </div>
              
              <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center bg-slate-50 ${plan.iconColor}`}>
                <Shield className="w-8 h-8" />
              </div>
              
              <div className="w-full space-y-3 mb-8">
                <div className="flex justify-between p-3 bg-teal-50/50 rounded-lg border border-teal-100/50">
                  <span className="text-slate-500 text-sm">Initial deposit:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.deposit}</span>
                </div>
                <div className="flex justify-between p-3 bg-teal-50/50 rounded-lg border border-teal-100/50">
                  <span className="text-slate-500 text-sm">Leverage:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.leverage}</span>
                </div>
                <div className="flex justify-between p-3 bg-teal-50/50 rounded-lg border border-teal-100/50">
                  <span className="text-slate-500 text-sm">Description:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.description}</span>
                </div>
              </div>

              <button 
                onClick={() => handleCreateAccount(plan.name)}
                disabled={isCreating}
                className="w-full py-3 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isCreating ? 'CREATING...' : 'CREATE LIVE ACCOUNT'}
              </button>
            </div>
          ))}
        </motion.div>
      ) : (
        /* Accounts View */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {filteredAccounts.map(account => (
            <div key={account.id} className="bg-[#f8f9fa] rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-lg relative border border-slate-200">
              {/* Card Header Menu */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                  className="text-slate-400 p-2 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                
                <AnimatePresence>
                  {activeMenuId === account.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-30"
                    >
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        disabled={deletingId === account.id}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        {deletingId === account.id ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Icon & Balance */}
              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-md text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">₹{account.balance.toLocaleString('en-IN')}</h2>
              </div>
              
              {/* Account Details */}
              <div className="flex flex-col items-center space-y-1 mb-8 text-sm">
                <p className="text-slate-500">Account: <span className="text-slate-800 font-semibold">{account.plan}</span></p>
                {account.mt5Id ? (
                  <>
                    <p className="text-slate-500">MT5 ID: <span className="text-slate-800 font-semibold">{account.mt5Id}</span></p>
                    <p className="text-slate-500 flex items-center gap-2">
                      MT5 Password: 
                      <span className="text-slate-800 font-semibold">
                        {showPasswords[account.id] ? account.mt5Password : '********'}
                      </span>
                      <button onClick={() => togglePassword(account.id)} className="text-blue-500 hover:text-blue-700 p-1">
                        {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </p>
                    <p className="text-slate-500">Server: <span className="text-slate-800 font-semibold">{account.server}</span></p>
                  </>
                ) : (
                  <div className="mt-2 py-2 px-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-600 font-semibold text-xs flex items-center gap-2">
                    <History className="w-4 h-4" />
                    MT5 Credentials Pending Assignment
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => { setSelectedAccountId(account.id); setDepositModalOpen(true); }}
                  className="w-full py-3 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  DEPOSIT
                </button>
                <button className="w-full py-3 bg-white text-red-500 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all">
                  WITHDRAW
                </button>
                <button 
                  onClick={() => setViewingAccountId(account.id)}
                  className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-all"
                >
                  SHOW ACCOUNT DETAILS
                </button>
              </div>
            </div>
          ))}

          {/* Add New Account Card */}
          <div 
            onClick={() => {
              if (activeTab === 'DEMO') {
                showError('You cannot create this account');
              } else {
                setShowPlans(true);
              }
            }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 border-dashed rounded-3xl p-6 w-full max-w-sm flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all min-h-[480px] group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-white font-bold tracking-wide">ADD NEW ACCOUNT</span>
          </div>
        </motion.div>
      )}

      <DepositModal 
        isOpen={depositModalOpen}
        onClose={() => { setDepositModalOpen(false); setSelectedAccountId(null); }}
        accountId={selectedAccountId || ''}
        onSuccess={() => {
           setDepositModalOpen(false);
           fetchAccounts();
        }}
      />
    </div>
  );
}
