'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, EyeOff, Check, X, Shield, History, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import DepositModal from '@/components/features/DepositModal';
import WithdrawalModal from '@/components/features/WithdrawalModal';
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
    iconColor: 'text-emerald-500',
  },
  {
    name: 'Platinum',
    deposit: '$100 (₹9000)',
    leverage: '1:500',
    description: 'Platinum Account',
    iconColor: 'text-indigo-500',
  },
  {
    name: 'Premium',
    deposit: '$500 (₹45000)',
    leverage: '1:500',
    description: 'Premium Account',
    iconColor: 'text-red-500',
  },
  {
    name: 'Platinum +',
    deposit: '$1000 (₹90000)',
    leverage: '1:500',
    description: 'Platinum + Account',
    iconColor: 'text-yellow-500',
  }
];

export default function AccountsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'LIVE' | 'DEMO'>('LIVE');
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [accountPayments, setAccountPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const checkKycAndFetch = async () => {
      try {
        const { data: user } = await api.get('/api/users/me');
        if (user.kycStatus !== 'APPROVED') {
          router.push('/kyc');
          return;
        }
        fetchAccounts();
      } catch (error) {
        showError('Failed to verify user status');
        setLoading(false);
      }
    };
    checkKycAndFetch();
  }, [router, showError]);

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
      const [paymentsRes, withdrawalsRes] = await Promise.all([
        api.get(`/api/payments?accountId=${accountId}`),
        api.get(`/api/withdrawals?accountId=${accountId}`)
      ]);
      const payments = paymentsRes.data.map((p: any) => ({ ...p, type: 'DEPOSIT' }));
      const withdrawals = withdrawalsRes.data.map((w: any) => ({ ...w, type: 'WITHDRAWAL' }));
      const merged = [...payments, ...withdrawals].sort((a, b) => 
        new Date(b.createdAt || b.submittedAt).getTime() - new Date(a.createdAt || a.submittedAt).getTime()
      );
      setAccountPayments(merged);
    } catch (error) {
      showError('Failed to load transaction history');
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
      await fetchAccounts();
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
              className="absolute left-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all z-10 shadow-sm"
            >
              ← Back to Accounts
            </button>
          )}
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            {showPlans ? 'Offers' : 'Accounts'}
          </h1>
        </div>
      )}

      {/* Tabs */}
      {!viewingAccountId && (
        <div className="flex justify-center mb-12">
          <div className="flex bg-white/80 rounded-xl p-1 border border-slate-200 backdrop-blur-md shadow-sm">
            <button
              onClick={() => setActiveTab('LIVE')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
                activeTab === 'LIVE' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeTab === 'LIVE' && (
                <motion.div layoutId="tab" className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg shadow-md" />
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
                activeTab === 'DEMO' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeTab === 'DEMO' && (
                <motion.div layoutId="tab" className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg shadow-md" />
              )}
              <span className="relative z-10">DEMO</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : viewingAccountId ? (
        /* Account Detail View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-8 pt-8 lg:pt-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setViewingAccountId(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-md"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
              <Shield className="w-3 h-3" />
              VERIFIED
            </div>
          </div>

          {/* Account Detail Card */}
          <div className="bg-white/90 rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="flex flex-col items-center mb-8">
              <span className="text-slate-500 font-semibold mb-2">BALANCE</span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">₹{accounts.find(a => a.id === viewingAccountId)?.balance.toLocaleString('en-IN') || 0}</h2>
              <p className="text-xl text-slate-500 font-bold mb-6">${((accounts.find(a => a.id === viewingAccountId)?.balance || 0) / 97).toFixed(2)}</p>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-semibold justify-center">
                <span className="text-slate-500">Equity: <span className="text-slate-700">₹{accounts.find(a => a.id === viewingAccountId)?.equity || 0}</span> <span className="text-slate-400 text-[10px]">(${( (accounts.find(a => a.id === viewingAccountId)?.equity || 0) / 97).toFixed(2)})</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Margin: <span className="text-slate-700">₹{accounts.find(a => a.id === viewingAccountId)?.margin || 0}</span> <span className="text-slate-400 text-[10px]">(${( (accounts.find(a => a.id === viewingAccountId)?.margin || 0) / 97).toFixed(2)})</span></span>
              </div>
            </div>

            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-4 sm:p-6 mb-8 text-center">
              <h3 className="text-slate-800 font-bold mb-6">MT5 Trading Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left sm:text-center">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2">MT5 ID</p>
                  <p className="text-slate-800 font-bold">{accounts.find(a => a.id === viewingAccountId)?.mt5Id || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Password</p>
                  <p className="text-slate-800 font-bold">{accounts.find(a => a.id === viewingAccountId)?.mt5Password || 'Not assigned'}</p>
                  {!accounts.find(a => a.id === viewingAccountId)?.mt5Password && (
                    <p className="text-[10px] text-slate-400 mt-2">Contact admin to update your MT5 credentials</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Server</p>
                  <p className="text-slate-800 font-bold">{accounts.find(a => a.id === viewingAccountId)?.server || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-8 text-sm font-semibold">
              <span className="text-slate-500">ACCOUNT: <span className="text-slate-700">{accounts.find(a => a.id === viewingAccountId)?.plan}</span> | LEVERAGE: <span className="text-slate-700">1:500</span></span>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <button 
                onClick={() => { setSelectedAccountId(viewingAccountId); setDepositModalOpen(true); }}
                className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Deposit
              </button>
              <button 
                onClick={() => { setSelectedAccountId(viewingAccountId); setWithdrawalModalOpen(true); }}
                className="px-6 sm:px-8 py-2.5 border border-red-300 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all"
              >
                Withdraw
              </button>
              <button className="px-6 sm:px-8 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all">
                Change Password
              </button>
            </div>
          </div>

          {/* Payment History Section */}
          <div>
            <div className="flex gap-4 border-b border-slate-200/60 mb-6">
              <button className="px-4 py-2 text-slate-800 font-bold border-b-2 border-indigo-500">
                Payment History
              </button>
              <button className="px-4 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                Trading History
              </button>
            </div>

            <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl min-h-[300px]">
              {loadingPayments ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                </div>
              ) : accountPayments.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-semibold">No payment history found for this account.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountPayments.map((payment) => {
                    const isDeposit = payment.type === 'DEPOSIT';
                    return (
                    <div key={payment.id} className="bg-slate-50 border border-slate-100 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${isDeposit ? 'bg-teal-500' : 'bg-rose-500'}`}></div>
                          <span className={`${isDeposit ? 'text-teal-600' : 'text-rose-600'} text-xs font-bold tracking-wider`}>
                            {isDeposit ? 'DEPOSIT' : 'WITHDRAWAL'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold mb-1">Amount:</p>
                        <p className={`${isDeposit ? 'text-teal-600' : 'text-rose-600'} font-bold text-lg`}>
                          {isDeposit ? '+' : '-'}₹{payment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-1">Status:</p>
                        {payment.status === 'APPROVED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{payment.status}</span>
                        )}
                        {payment.status === 'REJECTED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">{payment.status}</span>
                        )}
                        {payment.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">{payment.status}</span>
                        )}
                        {!['APPROVED','REJECTED','PENDING'].includes(payment.status) && (
                          <p className="font-bold text-slate-700">{payment.status}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-1">Date:</p>
                        <p className="text-slate-700 font-bold">{new Date(payment.submittedAt || payment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-1">{isDeposit ? (payment.upiApp ? 'UPI App:' : 'Transaction ID:') : 'Method:'}</p>
                        <p className="text-slate-700 font-bold truncate">{isDeposit ? (payment.upiApp || payment.transactionId) : payment.method}</p>
                      </div>
                      {payment.status === 'REJECTED' && payment.rejectionReason && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-slate-500 text-xs font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-red-600 text-sm">{payment.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )})}</div>
              )}
            </div>
          </div>
        </motion.div>
      ) : showPlans ? (
        /* Plans View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto"
        >
          {plans.map((plan, i) => (
            <div key={i} className="bg-white/90 border border-slate-200 rounded-3xl p-6 w-full flex flex-col items-center shadow-lg">
              <div className="flex justify-between w-full items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                <span className="bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold px-2 py-1 rounded-md">Live</span>
              </div>
              
              <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center bg-slate-100 ${plan.iconColor}`}>
                <Shield className="w-8 h-8" />
              </div>
              
              <div className="w-full space-y-3 mb-8">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-sm">Initial deposit:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.deposit}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-sm">Leverage:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.leverage}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-sm">Description:</span>
                  <span className="text-slate-800 font-bold text-sm">{plan.description}</span>
                </div>
              </div>

              <button 
                onClick={() => handleCreateAccount(plan.name)}
                disabled={isCreating}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isCreating ? 'CREATING...' : 'CREATE LIVE ACCOUNT'}
              </button>
            </div>
          ))}
        </motion.div>
      ) : (
        /* Accounts View */
        <div className="relative group w-full max-w-7xl mx-auto">
          {/* Left Arrow for mobile */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Right Arrow for mobile */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <motion.div 
            ref={scrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex overflow-x-auto sm:flex-wrap gap-6 justify-start sm:justify-center pb-8 pt-2 px-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          {filteredAccounts.map(account => (
            <div key={account.id} className="snap-center shrink-0 w-[85vw] sm:w-full bg-white/90 rounded-3xl p-4 sm:p-6 max-w-sm flex flex-col shadow-lg relative border border-slate-200">
              {/* Card Header Menu */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                  className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-md text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹{account.balance.toLocaleString('en-IN')}</h2>
                <p className="text-sm text-slate-500 font-bold mt-1">${(account.balance / 97).toFixed(2)}</p>
              </div>
              
              {/* Account Details */}
              <div className="flex flex-col items-center space-y-1 mb-8 text-sm">
                <p className="text-slate-500">Account: <span className="text-slate-700 font-semibold">{account.plan}</span></p>
                {account.mt5Id ? (
                  <>
                    <p className="text-slate-500">MT5 ID: <span className="text-slate-700 font-semibold">{account.mt5Id}</span></p>
                    <p className="text-slate-500 flex items-center gap-2">
                      MT5 Password: 
                      <span className="text-slate-700 font-semibold">
                        {showPasswords[account.id] ? account.mt5Password : '********'}
                      </span>
                      <button onClick={() => togglePassword(account.id)} className="text-indigo-500 hover:text-indigo-700 p-1">
                        {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </p>
                    <p className="text-slate-500">Server: <span className="text-slate-700 font-semibold">{account.server}</span></p>
                  </>
                ) : (
                  <div className="mt-2 py-3 px-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-600 font-semibold text-xs flex flex-col items-center gap-1.5 text-center">
                    <div className="flex items-center gap-2"><History className="w-4 h-4" /> MT5 Credentials Pending Assignment</div>
                    <div className="text-[10px] text-orange-400 uppercase tracking-wide font-bold">MT5 ID password will be visible in 2-3 hours</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => { setSelectedAccountId(account.id); setDepositModalOpen(true); }}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  DEPOSIT
                </button>
                <button 
                  onClick={() => { setSelectedAccountId(account.id); setWithdrawalModalOpen(true); }}
                  className="w-full py-3 border border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                >
                  WITHDRAW
                </button>
                <button 
                  onClick={() => setViewingAccountId(account.id)}
                  className="w-full py-3 border border-indigo-300 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all"
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
            className="snap-center shrink-0 w-[85vw] bg-white/50 backdrop-blur-sm border-2 border-dashed border-indigo-300 rounded-3xl p-4 sm:p-6 max-w-sm flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all min-h-[300px] sm:min-h-[480px] group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-slate-700 font-bold tracking-wide">ADD NEW ACCOUNT</span>
          </div>
          </motion.div>
        </div>
      )}

      <DepositModal 
        isOpen={depositModalOpen}
        onClose={() => { setDepositModalOpen(false); setSelectedAccountId(null); }}
        accountId={selectedAccountId || ''}
        onSuccess={() => {
           setDepositModalOpen(false);
           fetchAccounts();
           if (selectedAccountId) fetchPayments(selectedAccountId);
        }}
      />
      
      <WithdrawalModal
        isOpen={withdrawalModalOpen}
        onClose={() => { setWithdrawalModalOpen(false); setSelectedAccountId(null); }}
        accountId={selectedAccountId || ''}
        plan={accounts.find(a => a.id === selectedAccountId)?.plan || ''}
        onSuccess={() => {
           setWithdrawalModalOpen(false);
           fetchAccounts();
           if (selectedAccountId) fetchPayments(selectedAccountId);
        }}
      />
    </div>
  );
}
