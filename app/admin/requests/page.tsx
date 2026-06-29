'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/api/payments?status=all');
      // We use the payments endpoint with admin role to get all data
      // But we actually want payment requests. Let's fetch them differently.
      // Since we don't have a dedicated admin payment requests endpoint,
      // we'll work with what we have - fetch all payments and their linked requests
      setRequests([]);
    } catch {
      showError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [showError]);

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Requests</h1>
        <p className="text-slate-500 mt-1">Create and manage payment requests for users</p>
      </div>

      {/* Create Payment Request */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Request</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="request-user-search" className="block text-xs font-medium text-slate-500 mb-1">
              Select User
            </label>
            {selectedUser ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-800">{selectedUser.fullName}</span>
                <span className="text-xs text-blue-600">({selectedUser.email})</span>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserSearch('');
                  }}
                  className="ml-auto text-blue-400 hover:text-blue-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <input
                  id="request-user-search"
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onFocus={() => userSearch.length >= 1 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && users.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setShowDropdown(false);
                          setUserSearch('');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-blue-50 text-sm flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900">{u.fullName}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="request-amount" className="block text-xs font-medium text-slate-500 mb-1">
              Amount (₹)
            </label>
            <input
              id="request-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreateRequest}
              disabled={creating || !selectedUser || !amount}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {creating && <Spinner size="sm" />}
              Send Request
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">User</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Amount</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Status</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden md:table-cell">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{req.user?.fullName}</p>
                    <p className="text-xs text-slate-500">{req.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ₹{req.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
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
                      <span className="text-xs text-slate-400">No proof yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No payment requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
