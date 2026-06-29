'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

const editSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

type EditForm = z.infer<typeof editSchema>;

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalPaid: number;
  createdAt: string;
  kycStatus: string | null;
  kyc?: {
    id: string;
    status: string;
    selfieUrl?: string;
    rejectionReason?: string;
  } | null;
  unreadNotifications: number;
}

export default function ProfilePage() {
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<{ status: string; amount: number }[]>([]);
  const [requests, setRequests] = useState<{ status: string; amount: number }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, paymentsRes, requestsRes] = await Promise.all([
          api.get('/api/users/me'),
          api.get('/api/payments'),
          api.get('/api/payments/my-requests'),
        ]);
        setUser(userRes.data);
        setPayments(paymentsRes.data);
        setRequests(requestsRes.data);
        reset({
          fullName: userRes.data.fullName,
          email: userRes.data.email,
          phone: userRes.data.phone,
        });
      } catch {
        showError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reset, showError]);

  const onSave = async (data: EditForm) => {
    setSaving(true);
    try {
      const { data: updated } = await api.patch(`/api/users/${user?.id}`, data);
      setUser((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
      showSuccess('Profile updated');
    } catch {
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const pendingAmount = requests
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and view statistics</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  id="profile-name"
                  {...register('fullName')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.fullName ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="profile-email"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  id="profile-phone"
                  {...register('phone')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-400' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {saving && <Spinner size="sm" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  reset({ fullName: user.fullName, email: user.email, phone: user.phone });
                }}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Full Name</p>
              <p className="text-slate-900 font-medium">{user.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Email</p>
              <p className="text-slate-900 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Phone</p>
              <p className="text-slate-900 font-medium">{user.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* KYC Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">KYC Status</h2>
        <div className="flex items-center gap-4">
          {user.kyc?.selfieUrl && (
            <img
              src={user.kyc.selfieUrl}
              alt="KYC selfie"
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-100"
            />
          )}
          <div>
            <Badge
              variant={
                user.kycStatus === 'APPROVED'
                  ? 'approved'
                  : user.kycStatus === 'REJECTED'
                  ? 'rejected'
                  : 'pending'
              }
            >
              {user.kycStatus || 'Not Submitted'}
            </Badge>
            {user.kyc?.rejectionReason && (
              <p className="text-red-600 text-sm mt-2">
                Reason: {user.kyc.rejectionReason}
              </p>
            )}
            {(user.kycStatus === 'REJECTED' || !user.kycStatus) && (
              <a
                href="/kyc"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {user.kycStatus === 'REJECTED' ? 'Resubmit KYC →' : 'Submit KYC →'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Payment Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-700">₹{user.totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-sm text-green-600 mt-1">Total Paid</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-700">{approvedCount}</p>
            <p className="text-sm text-blue-600 mt-1">Approved Payments</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
            <p className="text-sm text-yellow-600 mt-1">Pending Requests</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-700">₹{pendingAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-purple-600 mt-1">Pending Amount</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Member Since</p>
            <p className="text-slate-900 font-medium">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Account ID</p>
            <p className="text-slate-900 font-mono text-xs">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
