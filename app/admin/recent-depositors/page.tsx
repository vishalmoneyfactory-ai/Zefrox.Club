'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Save } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

interface DepositorData {
  id: string;
  fullName: string;
  email: string;
  recentDepositTotal: number;
  latestDepositDate: string;
  accounts: {
    id: string;
    mt5Id: string;
    type: string;
    balance: number;
  }[];
}

export default function RecentDepositorsPage() {
  const { showSuccess, showError } = useToast();
  const [depositors, setDepositors] = useState<DepositorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editedBalances, setEditedBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDepositors();
  }, []);

  const fetchDepositors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/recent-depositors');
      setDepositors(data);
      setEditedBalances({});
    } catch (error) {
      showError('Failed to load recent depositors');
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceChange = (accountId: string, value: string) => {
    const numValue = parseFloat(value);
    setEditedBalances(prev => ({
      ...prev,
      [accountId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSubmit = async () => {
    const updates = Object.keys(editedBalances).map(accountId => ({
      accountId,
      newBalance: editedBalances[accountId]
    }));

    if (updates.length === 0) {
      showSuccess('No changes to save');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/admin/bulk-update-balances', { updates });
      showSuccess(`Successfully updated ${updates.length} account balances`);
      fetchDepositors();
    } catch (error) {
      showError('Failed to update balances');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="relative z-10 space-y-8 animate-fade-in pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Banknote className="w-5 h-5" />
            </span>
            Recent Depositors
          </h1>
          <p className="text-slate-600 mt-2 font-medium">Bulk edit account balances for users who deposited in the last 7 days.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Recent Deposits (7d)</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Latest Date</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[250px]">Account Balances</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depositors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                      No recent depositors found in the last 7 days.
                    </td>
                  </tr>
                ) : (
                  depositors.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{user.fullName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        ₹{user.recentDepositTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {new Date(user.latestDepositDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {user.accounts.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No trading accounts</span>
                        ) : (
                          <div className="space-y-2">
                            {user.accounts.map(acc => {
                              const isEdited = editedBalances[acc.id] !== undefined;
                              const currentVal = isEdited ? editedBalances[acc.id] : acc.balance;
                              
                              return (
                                <div key={acc.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div className="text-xs font-bold text-slate-500 w-16 truncate" title={acc.mt5Id}>{acc.mt5Id}</div>
                                  <div className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{acc.type}</div>
                                  <span className="text-slate-400 font-medium ml-auto">$</span>
                                  <input
                                    type="number"
                                    value={currentVal}
                                    onChange={(e) => handleBalanceChange(acc.id, e.target.value)}
                                    className={`w-28 text-right p-1.5 text-sm font-bold border rounded-md outline-none transition-colors ${
                                      isEdited 
                                        ? 'bg-yellow-50 border-yellow-300 text-yellow-800 focus:border-yellow-500' 
                                        : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400'
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {depositors.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-slate-500 font-medium">
                {Object.keys(editedBalances).length > 0 ? (
                  <span className="text-yellow-600 font-bold">{Object.keys(editedBalances).length} balances modified (unsaved)</span>
                ) : (
                  <span>No changes made</span>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={Object.keys(editedBalances).length === 0}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border-0 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit All Changes
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
