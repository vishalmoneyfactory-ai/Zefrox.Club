'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, XCircle, Clock, User, CheckCircle2, IndianRupee } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  payment?: {
    id: string;
    status: string;
  } | null;
}

export default function AdminRequestsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);

  // Create form state
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all payment requests through the payments API
  const fetchAllRequests = useCallback(async () => {
    try {
      // Get all users first, then assemble requests data
      const { data: usersData } = await api.get('/api/users');
      const allRequests: PaymentRequest[] = [];

      // Fetch details for each user to get their payment requests
      for (const user of usersData.slice(0, 50)) {
        // Limit to prevent too many requests
        try {
          const { data: userDetail } = await api.get(`/api/users/${user.id}`);
          if (userDetail.paymentRequests) {
            for (const req of userDetail.paymentRequests) {
              allRequests.push({
                ...req,
                user: { fullName: userDetail.fullName, email: userDetail.email },
              });
            }
          }
        } catch {
          // Skip users we can't fetch
        }
      }

      allRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(allRequests);
    } catch {
      showError('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const searchUsers = useCallback(async (search: string) => {
    try {
      const { data: usersData } = await api.get(
        `/api/users?search=${encodeURIComponent(search)}`
      );
      setUsers(usersData.filter((u: UserOption & { role: string }) => u.role !== 'ADMIN'));
    } catch {
      // Ignore search errors
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (userSearch.length >= 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(userSearch);
        setShowDropdown(true);
      }, 300);
    } else {
      setUsers([]);
      setShowDropdown(false);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [userSearch, searchUsers]);

  const handleCreateRequest = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      showError('Select a user and enter a valid amount');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/payments/request', {
        userId: selectedUser.id,
        amount: parseFloat(amount),
      });
      showSuccess(
        `Payment request of ₹${parseFloat(amount).toLocaleString('en-IN')} sent to ${selectedUser.fullName}`
      );
      setSelectedUser(null);
      setUserSearch('');
      setAmount('');
      fetchAllRequests();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-indigo-600" />
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
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aurora-purple/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-black text-slate-800 drop-shadow-sm flex items-center gap-3">
            <Send className="w-8 h-8 text-indigo-600" /> Payment Requests
          </h1>
          <p className="text-slate-600 mt-2 font-medium">Issue and track payment requests to users</p>
        </motion.div>

        {/* Create Payment Request */}
        <motion.div variants={itemVariants} className="z-[100] relative">
          <Card glass glow className="p-6 bg-white/80 border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] relative">
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-aurora-cyan via-aurora-purple to-pink-500 opacity-50" />
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-aurora-cyan" /> Issue New Request
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1 w-full relative">
                <label htmlFor="request-user-search" className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Select User
                </label>
                {selectedUser ? (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border-indigo-200 rounded-xl w-full">
                    <span className="text-sm font-bold text-slate-800">{selectedUser.fullName}</span>
                    <span className="text-xs text-indigo-600/80">({selectedUser.email})</span>
                    <button
                      onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                      className="ml-auto text-indigo-600 hover:text-slate-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="relative z-20">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="request-user-search"
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-white/80 border-slate-200 text-slate-800 placeholder-slate-600 focus:outline-none focus:border-aurora-purple/50 focus:ring-1 focus:ring-aurora-purple/50 transition-all text-sm shadow-inner"
                      onFocus={() => userSearch.length >= 1 && setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    <AnimatePresence>
                      {showDropdown && users.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-50 mt-2 w-full bg-white border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl"
                        >
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDropdown(false);
                                setUserSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50/50 text-sm flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 last:border-0 transition-colors"
                            >
                              <span className="font-bold text-slate-800">{u.fullName}</span>
                              <span className="text-xs text-slate-600 mt-1 sm:mt-0">{u.email}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <div className="w-full md:w-48">
                <label htmlFor="request-amount" className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Amount (₹)
                </label>
                <input
                  id="request-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  className="w-full px-4 py-3 bg-white/80 border-slate-200 text-slate-800 placeholder-slate-600 focus:outline-none focus:border-aurora-purple/50 focus:ring-1 focus:ring-aurora-purple/50 transition-all text-sm shadow-inner font-mono font-bold"
                />
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <Button
                  variant="glow"
                  onClick={handleCreateRequest}
                  disabled={creating || !selectedUser || !amount}
                  loading={creating}
                  className="w-full md:w-auto py-3 px-8 !bg-aurora-purple/20 !border-aurora-purple/50 !text-indigo-600 hover:!bg-aurora-purple/30 hover:!text-slate-800 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                >
                  <Send className="w-4 h-4 mr-2" /> Issue Request
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Requests Table */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-0 bg-white/80 border-slate-200/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] overflow-hidden relative z-0">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs uppercase text-slate-600 font-bold px-6 py-4 tracking-wider">User</th>
                    <th className="text-left text-xs uppercase text-slate-600 font-bold px-6 py-4 tracking-wider">Amount</th>
                    <th className="text-left text-xs uppercase text-slate-600 font-bold px-6 py-4 tracking-wider hidden sm:table-cell">Date Issued</th>
                    <th className="text-left text-xs uppercase text-slate-600 font-bold px-6 py-4 tracking-wider">Request Status</th>
                    <th className="text-left text-xs uppercase text-slate-600 font-bold px-6 py-4 tracking-wider hidden md:table-cell">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {requests.map((req) => (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{req.user?.fullName}</p>
                          <p className="text-xs text-slate-600 mt-1">{req.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-aurora-cyan/10 text-aurora-cyan text-sm font-black border border-aurora-cyan/20">
                            ₹{req.amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell font-medium">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={req.status === 'COMPLETED' ? 'approved' : 'pending'}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {req.payment ? (
                            <Badge
                              variant={
                                req.payment.status === 'APPROVED'
                                  ? 'approved'
                                  : req.payment.status === 'REJECTED'
                                  ? 'rejected'
                                  : 'proof-uploaded'
                              }
                            >
                              {req.payment.status.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                              <Clock className="w-3 h-3" /> Awaiting Proof
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {requests.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-700 font-bold text-lg mb-1">No Active Requests</p>
                <p className="text-slate-500 font-medium">Create a payment request to see it listed here.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
