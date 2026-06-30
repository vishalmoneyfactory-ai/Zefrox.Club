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
        <Spinner size="lg" className="text-aurora-cyan" />
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
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-aurora-purple/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-aurora-cyan/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <User className="w-8 h-8 text-aurora-purple" /> User Profile
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your personal information and view statistics</p>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={itemVariants}>
          <Card glass glow className="p-6 sm:p-8 border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-aurora-cyan" /> Personal Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-aurora-cyan hover:text-white font-bold flex items-center gap-2 px-4 py-2 bg-aurora-cyan/10 hover:bg-aurora-cyan/20 border border-aurora-cyan/20 rounded-lg transition-all"
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
                      <label htmlFor="profile-name" className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                      <input
                        id="profile-name"
                        {...register('fullName')}
                        className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.fullName ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.fullName && <p className="text-red-400 text-xs ml-1 mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-email" className="text-sm font-semibold text-slate-300 ml-1">Email</label>
                      <input
                        id="profile-email"
                        {...register('email')}
                        className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="profile-phone" className="text-sm font-semibold text-slate-300 ml-1">Phone</label>
                      <input
                        id="profile-phone"
                        {...register('phone')}
                        className={`w-full px-4 py-3 bg-slate-950/50 rounded-xl border text-white placeholder-slate-600 transition-all text-sm ${errors.phone ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50'} focus:outline-none focus:ring-2`}
                      />
                      {errors.phone && <p className="text-red-400 text-xs ml-1 mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        reset({ fullName: user.fullName, email: user.email, phone: user.phone });
                      }}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/5"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="glow" disabled={saving} loading={saving} className="px-8">
                      Save Changes
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-aurora-cyan/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Full Name</p>
                      <p className="text-white font-semibold text-lg">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-aurora-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Email</p>
                      <p className="text-white font-semibold text-sm break-all">{user.email}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-aurora-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-aurora-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Phone</p>
                      <p className="text-white font-semibold text-lg">{user.phone}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* KYC Status */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-6 sm:p-8 border-white/5 bg-slate-900/60 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-aurora-indigo" /> KYC Status
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-4">
                {user.kyc?.selfieUrl && (
                  <div className="relative group cursor-pointer w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10" onClick={() => setImageModal({ open: true, url: user.kyc!.selfieUrl!, title: 'Your KYC Selfie' })}>
                    <img src={user.kyc.selfieUrl} alt="KYC selfie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                )}
                <div>
                  <Badge variant={user.kycStatus === 'APPROVED' ? 'approved' : user.kycStatus === 'REJECTED' ? 'rejected' : 'pending'}>
                    {user.kycStatus || 'Not Submitted'}
                  </Badge>
                  {user.kyc?.rejectionReason && (
                    <p className="text-red-400 text-sm mt-2 font-medium bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      Reason: {user.kyc.rejectionReason}
                    </p>
                  )}
                  {(user.kycStatus === 'REJECTED' || !user.kycStatus) && (
                    <a href="/kyc" className="inline-flex mt-3 text-sm text-aurora-cyan hover:text-white font-bold items-center gap-2 transition-colors">
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
          <Card glass className="p-6 sm:p-8 border-white/5 bg-slate-900/60 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-aurora-purple" /> Trading Statistics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-green-400">₹{user.totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-xs font-bold text-green-500/70 uppercase tracking-widest mt-2">Total Paid</p>
              </div>
              <div className="p-5 bg-aurora-cyan/10 border border-aurora-cyan/20 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-aurora-cyan">{approvedCount}</p>
                <p className="text-xs font-bold text-aurora-cyan/70 uppercase tracking-widest mt-2">Approved</p>
              </div>
              <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-yellow-400">{pendingCount}</p>
                <p className="text-xs font-bold text-yellow-500/70 uppercase tracking-widest mt-2">Pending Req</p>
              </div>
              <div className="p-5 bg-aurora-purple/10 border border-aurora-purple/20 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-aurora-purple">₹{pendingAmount.toLocaleString('en-IN')}</p>
                <p className="text-xs font-bold text-aurora-purple/70 uppercase tracking-widest mt-2">Pending Amt</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={itemVariants}>
          <Card glass className="p-6 sm:p-8 border-white/5 bg-slate-900/60 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" /> Account Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-white font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Account ID</p>
                <p className="text-slate-300 font-mono text-xs break-all">{user.id}</p>
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
