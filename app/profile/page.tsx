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
        <Spinner size="lg" className="text-blue-500" />
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
    <div className="max-w-4xl mx-auto relative z-10 pb-12 selection:bg-blue-500/30 selection:text-white">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shrink-0">
              <User className="w-6 h-6 text-indigo-400" /> 
            </div>
            User Profile
          </h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">Manage your personal information and view statistics</p>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={itemVariants}>
          <Card glass glow className="p-6 sm:p-10 border-white/10 bg-[#0b1221]/80 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-6 h-6 text-blue-400" /> Personal Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-blue-400 hover:text-white font-bold flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
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
                      <label htmlFor="profile-name" className="text-sm font-semibold text-slate-400 ml-1">Full Name</label>
                      <input
                        id="profile-name"
                        {...register('fullName')}
                        className={`w-full px-5 py-4 bg-[#111827]/60 rounded-xl border text-white placeholder-slate-500 transition-all text-sm ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.fullName && <p className="text-red-400 text-xs ml-1 mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-email" className="text-sm font-semibold text-slate-400 ml-1">Email</label>
                      <input
                        id="profile-email"
                        {...register('email')}
                        className={`w-full px-5 py-4 bg-[#111827]/60 rounded-xl border text-white placeholder-slate-500 transition-all text-sm ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-phone" className="text-sm font-semibold text-slate-400 ml-1">Phone</label>
                      <input
                        id="profile-phone"
                        {...register('phone')}
                        className={`w-full px-5 py-4 bg-[#111827]/60 rounded-xl border text-white placeholder-slate-500 transition-all text-sm ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.phone && <p className="text-red-400 text-xs ml-1 mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        reset({ fullName: user.fullName, email: user.email, phone: user.phone });
                      }}
                      className="px-6 py-3 bg-[#111827]/60 hover:bg-[#111827]/80 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/10"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" disabled={saving} loading={saving} className="px-8 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                      Save Changes
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-[#111827]/40 p-6 rounded-[1.5rem] border border-white/5 flex flex-col gap-4 shadow-sm hover:border-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Full Name</p>
                      <p className="text-white font-black text-xl">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="bg-[#111827]/40 p-6 rounded-[1.5rem] border border-white/5 flex flex-col gap-4 shadow-sm hover:border-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Email</p>
                      <p className="text-white font-bold text-sm break-all">{user.email}</p>
                    </div>
                  </div>
                  <div className="bg-[#111827]/40 p-6 rounded-[1.5rem] border border-white/5 flex flex-col gap-4 shadow-sm hover:border-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Phone className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Phone</p>
                      <p className="text-white font-black text-xl">{user.phone}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* KYC Status */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-6 sm:p-10 border-white/10 bg-[#0b1221]/80 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <Camera className="w-5 h-5 text-indigo-400" /> 
                </div>
                KYC Status
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center mt-6">
                {user.kyc?.selfieUrl && (
                  <div className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-xl" onClick={() => setImageModal({ open: true, url: user.kyc!.selfieUrl!, title: 'Your KYC Selfie' })}>
                    <img src={user.kyc.selfieUrl} alt="KYC selfie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#060a14]/60 backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  </div>
                )}
                <div>
                  <Badge variant={user.kycStatus === 'APPROVED' ? 'approved' : user.kycStatus === 'REJECTED' ? 'rejected' : 'pending'}>
                    {user.kycStatus || 'Not Submitted'}
                  </Badge>
                  {user.kyc?.rejectionReason && (
                    <p className="text-red-300 text-sm mt-3 font-medium bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 backdrop-blur-md shadow-inner">
                      <span className="font-bold text-red-400">Reason:</span> {user.kyc.rejectionReason}
                    </p>
                  )}
                  {(user.kycStatus === 'REJECTED' || !user.kycStatus) && (
                    <a href="/kyc" className="inline-flex mt-4 text-sm text-blue-400 hover:text-white font-bold items-center gap-2 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/20">
                      {user.kycStatus === 'REJECTED' ? 'Resubmit KYC' : 'Submit KYC'} <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Statistics */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-4 sm:p-8 border-white/10 bg-[#0b1221]/80 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-5">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Hash className="w-5 h-5 text-blue-400" /> 
              </div>
              Trading Statistics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-xl sm:text-3xl font-black text-emerald-400">₹{user.totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mt-2">Total Paid</p>
              </div>
              <div className="p-4 sm:p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-blue-400">{approvedCount}</p>
                <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mt-2">Approved</p>
              </div>
              <div className="p-4 sm:p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-yellow-400">{pendingCount}</p>
                <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mt-2">Pending</p>
              </div>
              <div className="p-4 sm:p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                <p className="text-xl sm:text-3xl font-black text-indigo-400">₹{pendingAmount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest mt-2">Pending Amt</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-6 sm:p-10 border-white/10 bg-[#0b1221]/80 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="p-2.5 bg-[#111827] border border-white/10 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-400" /> 
              </div>
              Account Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#111827]/40 p-6 rounded-2xl border border-white/5 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Member Since</p>
                <p className="text-white font-bold text-lg">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-[#111827]/40 p-6 rounded-2xl border border-white/5 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Account ID</p>
                <p className="text-slate-300 font-mono text-sm break-all">{user.id}</p>
              </div>
            </div>
          </Card>
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
