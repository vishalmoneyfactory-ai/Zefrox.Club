'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import StatsCard from '@/components/features/StatsCard';
import Spinner from '@/components/ui/Spinner';

interface DashboardData {
  totalUsers: number;
  totalRegularUsers: number;
  pendingKyc: number;
  pendingPayments: number;
  approvedPayments: number;
  todayApprovedAmount: number;
  totalApprovedAmount: number;
  pendingRequestsAmount: number;
  paidTodayUsers: { id: string; fullName: string; totalPaid: number }[];
  notPaidTodayUsers: { id: string; fullName: string }[];
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment request form
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: dashData } = await api.get('/api/admin/dashboard');
      setData(dashData);
    } catch {
      showError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const searchUsers = useCallback(async (search: string) => {
    try {
      const { data: usersData } = await api.get(`/api/users?search=${encodeURIComponent(search)}`);
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
      showSuccess(`Payment request of ₹${parseFloat(amount).toLocaleString('en-IN')} sent to ${selectedUser.fullName}`);
      setSelectedUser(null);
      setUserSearch('');
      setAmount('');
      fetchDashboard();
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

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of platform activity and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Users" value={data.totalRegularUsers} color="blue" onClick={() => router.push('/admin/users')} />
        <StatsCard title="Pending KYC" value={data.pendingKyc} color="yellow" onClick={() => router.push('/admin/kyc')} />
        <StatsCard title="Pending Payments" value={data.pendingPayments} color="red" onClick={() => router.push('/admin/payments')} />
        <StatsCard title="Today's Collection" value={`₹${data.todayApprovedAmount.toLocaleString('en-IN')}`} color="green" />
        <StatsCard title="Total Collection" value={`₹${data.totalApprovedAmount.toLocaleString('en-IN')}`} color="purple" />
        <StatsCard title="Pending Amount" value={`₹${data.pendingRequestsAmount.toLocaleString('en-IN')}`} color="yellow" />
      </div>

      {/* Create Payment Request */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Payment Request</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="admin-user-search" className="block text-xs font-medium text-slate-500 mb-1">Select User</label>
            {selectedUser ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-800">{selectedUser.fullName}</span>
                <span className="text-xs text-blue-600">({selectedUser.email})</span>
                <button
                  onClick={() => { setSelectedUser(null); setUserSearch(''); }}
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
                  id="admin-user-search"
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
            <label htmlFor="admin-amount" className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
            <input
              id="admin-amount"
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

      {/* Paid Today / Not Paid Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Paid Today ({data.paidTodayUsers.length})
          </h3>
          {data.paidTodayUsers.length === 0 ? (
            <p className="text-slate-400 text-sm">No payments today</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.paidTodayUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900">{u.fullName}</span>
                  <span className="text-sm font-semibold text-green-700">₹{u.totalPaid.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Not Paid Today ({data.notPaidTodayUsers.length})
          </h3>
          {data.notPaidTodayUsers.length === 0 ? (
            <p className="text-slate-400 text-sm">Everyone has paid!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.notPaidTodayUsers.map((u) => (
                <div key={u.id} className="flex items-center px-3 py-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900">{u.fullName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
