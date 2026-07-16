'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Edit2, Camera, Calendar, Hash, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });

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
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const pendingAmount = requests
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-4xl mx-auto relative z-10 pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 rounded-2xl shrink-0">
              <User className="w-6 h-6 text-indigo-500" />
            </div>
            User Profile
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Manage your personal information and view statistics</p>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-6 sm:p-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4 border-b border-slate-100 pb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <User className="w-6 h-6 text-indigo-500" /> Personal Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSubmit(onSave)} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label htmlFor="profile-name" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Full Name</label>
                      <input
                        id="profile-name"
                        {...register('fullName')}
                        className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-sm ${errors.fullName ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs ml-1 mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-email" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Email</label>
                      <input
                        id="profile-email"
                        {...register('email')}
                        className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-sm ${errors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                      />
                      {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-phone" className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Phone</label>
                      <input
                        id="profile-phone"
                        {...register('phone')}
                        className={`bg-white/70 border text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 w-full transition-all text-sm ${errors.phone ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'} focus:outline-none`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs ml-1 mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        reset({ fullName: user.fullName, email: user.email, phone: user.phone });
                      }}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-sm font-bold rounded-xl transition-colors border border-slate-200"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" disabled={saving} loading={saving} className="px-8">
                      Save Changes
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <User className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Full Name</p>
                      <p className="text-slate-800 font-black text-xl">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Mail className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Email</p>
                      <p className="text-slate-800 font-bold text-sm break-all">{user.email}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Phone className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Phone</p>
                      <p className="text-slate-800 font-black text-xl">{user.phone}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* KYC Status */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 border border-indigo-200 rounded-xl">
                  <Camera className="w-5 h-5 text-indigo-500" />
                </div>
                KYC Status
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center mt-6">
                {user.kyc?.selfieUrl && (
                  <div className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-xl" onClick={() => setImageModal({ open: true, url: user.kyc!.selfieUrl!, title: 'Your KYC Selfie' })}>
                    <img src={user.kyc!.selfieUrl} alt="KYC selfie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-slate-700 drop-shadow-md" />
                    </div>
                  </div>
                )}
                <div>
                  <Badge variant={user.kycStatus === 'APPROVED' ? 'approved' : user.kycStatus === 'REJECTED' ? 'rejected' : 'pending'}>
                    {user.kycStatus || 'Not Submitted'}
                  </Badge>
                  {user.kyc?.rejectionReason && (
                    <p className="text-red-600 text-sm mt-3 font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-200 shadow-inner">
                      <span className="font-bold text-red-700">Reason:</span> {user.kyc!.rejectionReason}
                    </p>
                  )}
                  {(user.kycStatus === 'REJECTED' || !user.kycStatus) && (
                    <a href="/kyc" className="inline-flex mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-bold items-center gap-2 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                      {user.kycStatus === 'REJECTED' ? 'Resubmit KYC' : 'Submit KYC'} <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Statistics */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-4 sm:p-8">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="p-2 bg-indigo-100 border border-indigo-200 rounded-xl">
                <Hash className="w-5 h-5 text-indigo-500" />
              </div>
              Trading Statistics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="p-4 sm:p-5 bg-emerald-100 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-xl sm:text-3xl font-black text-emerald-700">₹{user.totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Total Paid</p>
              </div>
              <div className="p-4 sm:p-5 bg-indigo-100 border border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-indigo-700">{approvedCount}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-2">Approved</p>
              </div>
              <div className="p-4 sm:p-5 bg-amber-100 border border-amber-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-amber-700">{pendingCount}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-2">Pending</p>
              </div>
              <div className="p-4 sm:p-5 bg-violet-100 border border-violet-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-xl sm:text-3xl font-black text-violet-700">₹{pendingAmount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mt-2">Pending Amt</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(99,102,241,0.08)] rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              Account Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Member Since</p>
                <p className="text-slate-800 font-bold text-lg">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Account ID</p>
                <p className="text-slate-600 font-mono text-sm break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Fullscreen Image Viewer */}
      <ScreenshotModal
        isOpen={imageModal.open}
        onClose={() => setImageModal({ open: false, url: '', title: '' })}
        imageUrl={imageModal.url}
        title={imageModal.title}
      />
    </div>
  );
}
