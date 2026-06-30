'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Eye, Edit2, Trash2, ShieldAlert, CreditCard, Clock, Camera, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ScreenshotModal from '@/components/features/ScreenshotModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  totalPaid: number;
  createdAt: string;
  kyc?: { id: string; status: string } | null;
}

interface UserDetail extends User {
  payments: { id: string; amount: number; status: string; submittedAt: string; transactionId: string }[];
  paymentRequests: { id: string; amount: number; status: string; createdAt: string }[];
  kyc?: {
    id: string;
    status: string;
    fullName: string;
    address: string;
    upiId: string;
    bankAccount: string;
    ifscCode: string;
    aadhaarNumber?: string;
    selfieUrl: string;
    rejectionReason?: string;
  } | null;
}

export default function AdminUsersPage() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // View modal
  const [viewUser, setViewUser] = useState<UserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [imageModal, setImageModal] = useState<{ open: boolean; url: string; title: string }>({ open: false, url: '', title: '' });

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Delete modal
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setUsers(data);
    } catch {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, showError]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleView = async (userId: string) => {
    setViewLoading(true);
    try {
      const { data } = await api.get(`/api/users/${userId}`);
      setViewUser(data);
    } catch {
      showError('Failed to load user details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ fullName: user.fullName, email: user.email, phone: user.phone });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      await api.patch(`/api/users/${editUser.id}`, editForm);
      showSuccess('User updated');
      setEditUser(null);
      fetchUsers();
    } catch {
      showError('Failed to update user');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await api.delete(`/api/users/${deleteUser.id}`);
      showSuccess('User deleted');
      setDeleteUser(null);
      fetchUsers();
    } catch {
      showError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-aurora-cyan" />
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
    <div className="relative z-10 space-y-6 animate-fade-in pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aurora-cyan/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
              <Users className="w-8 h-8 text-aurora-cyan" /> User Management
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Manage all platform users, KYC, and history ({users.length} total)</p>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/60 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/50 transition-all text-sm backdrop-blur-md shadow-2xl"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card glass className="p-0 border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-white/5">
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Name & Email</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden sm:table-cell">Phone</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">KYC</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden lg:table-cell">Total Paid</th>
                    <th className="text-left text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-right text-xs uppercase text-slate-400 font-bold px-6 py-4 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{user.fullName}</p>
                          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 hidden sm:table-cell font-medium">{user.phone}</td>
                        <td className="px-6 py-4">
                          <Badge variant={user.kyc?.status === 'APPROVED' ? 'approved' : user.kyc?.status === 'REJECTED' ? 'rejected' : 'pending'}>
                            {user.kyc?.status || 'None'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-500/10 text-green-400 text-sm font-black border border-green-500/20">
                            ₹{user.totalPaid.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell font-medium">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleView(user.id)} className="p-2 hover:bg-aurora-cyan/20 rounded-xl text-aurora-cyan transition-colors border border-transparent hover:border-aurora-cyan/30 bg-aurora-cyan/10" title="View">
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(user)} className="p-2 hover:bg-yellow-500/20 rounded-xl text-yellow-400 transition-colors border border-transparent hover:border-yellow-500/30 bg-yellow-500/10" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            {user.role !== 'ADMIN' && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteUser(user)} className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors border border-transparent hover:border-red-500/30 bg-red-500/10" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 font-medium">No users found matching your search</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* View Modal */}
      <Modal isOpen={!!viewUser || viewLoading} onClose={() => setViewUser(null)} title="User Profile Details" size="xl">
        {viewLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" className="text-aurora-cyan" /></div>
        ) : viewUser ? (
          <div className="space-y-8 animate-fade-in text-white">
            {/* Header Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Paid</p>
                <p className="text-lg font-black text-green-400">₹{viewUser.totalPaid.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Joined</p>
                <p className="text-sm font-bold text-slate-300">{new Date(viewUser.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">KYC Status</p>
                <Badge variant={viewUser.kyc?.status === 'APPROVED' ? 'approved' : viewUser.kyc?.status === 'REJECTED' ? 'rejected' : 'pending'}>
                  {viewUser.kyc?.status || 'None'}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Role</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${viewUser.role === 'ADMIN' ? 'bg-aurora-purple/20 text-aurora-purple' : 'bg-slate-800 text-slate-300'}`}>{viewUser.role}</span>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Full Name</p>
                  <p className="text-sm font-bold">{viewUser.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-bold break-all">{viewUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phone</p>
                  <p className="text-sm font-bold">{viewUser.phone}</p>
                </div>
              </div>
            </div>

            {viewUser.kyc?.selfieUrl && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Camera className="w-4 h-4" /> Identity Verification</h3>
                <div className="relative group cursor-pointer inline-block rounded-xl overflow-hidden border-2 border-white/10" onClick={() => setImageModal({ open: true, url: viewUser.kyc!.selfieUrl, title: 'KYC Selfie' })}>
                  <img src={viewUser.kyc.selfieUrl} alt="KYC Selfie" className="w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            )}

            {viewUser.payments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Ledger ({viewUser.payments.length})</h3>
                <div className="bg-slate-950/50 rounded-xl border border-white/5 overflow-hidden custom-scrollbar max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/80 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 text-slate-400 font-bold text-xs uppercase">Amount</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-bold text-xs uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-bold text-xs uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {viewUser.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-black text-green-400">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.status === 'APPROVED' ? 'approved' : p.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                              {p.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{new Date(p.submittedAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewUser.paymentRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Admin Requests ({viewUser.paymentRequests.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {viewUser.paymentRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <span className="font-black text-aurora-cyan">₹{r.amount.toLocaleString('en-IN')}</span>
                      <Badge variant={r.status === 'COMPLETED' ? 'approved' : 'pending'}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="sm">
        <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="edit-name" className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
            <input
              id="edit-name"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50 text-sm transition-all"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-email" className="text-sm font-semibold text-slate-300 ml-1">Email</label>
            <input
              id="edit-email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50 text-sm transition-all"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-phone" className="text-sm font-semibold text-slate-300 ml-1">Phone</label>
            <input
              id="edit-phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 focus:border-aurora-cyan/50 text-sm transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setEditUser(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/5">
              Cancel
            </button>
            <Button variant="glow" onClick={handleSaveEdit} disabled={editSaving} loading={editSaving} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xl text-white font-black mb-2">Delete {deleteUser?.fullName}?</p>
          <p className="text-red-400/80 text-sm mb-8 font-medium bg-red-500/5 p-3 rounded-lg border border-red-500/10">This will permanently delete all their data including payments, KYC, and history.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteUser(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-colors border border-white/5">
              Cancel
            </button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting} loading={deleting} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ScreenshotModal
        isOpen={imageModal.open}
        onClose={() => setImageModal({ open: false, url: '', title: '' })}
        imageUrl={imageModal.url}
        title={imageModal.title}
      />
    </div>
  );
}
