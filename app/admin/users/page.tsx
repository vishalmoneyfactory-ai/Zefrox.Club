'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Trash2, Edit2, ShieldAlert, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  totalPaid: number;
  createdAt: string;
  kyc: {
    status: string;
  } | null;
}

export default function AdminUsersPage() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [viewModal, setViewModal] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const url = search ? `/api/users?search=${search}` : '/api/users';
      const { data } = await api.get(url);
      setUsers(data);
    } catch {
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/api/users/${deleteModal.id}`);
      setUsers(users.filter(u => u.id !== deleteModal.id));
      showSuccess(`User ${deleteModal.name} deleted successfully`);
      setDeleteModal({ open: false, id: '', name: '' });
    } catch {
      showError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10 selection:bg-blue-500/30 selection:text-white pb-12">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2 translate-x-1/4" />
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
               <User className="w-6 h-6 text-blue-400" />
            </span>
            Manage Users
          </h1>
          <p className="text-slate-400 mt-2 font-medium">View and manage all registered accounts on the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-12 pr-4 py-3 bg-[#111827]/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm backdrop-blur-sm"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card glass className="p-0 overflow-hidden bg-[#0b1221]/80 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className="flex justify-center p-20">
              <Spinner size="lg" className="text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center">
               <div className="w-20 h-20 mx-auto bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <Search className="w-8 h-8 text-slate-500" />
               </div>
               <p className="text-white font-bold text-lg mb-2">No users found</p>
               <p className="text-slate-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#111827]/60 backdrop-blur-md">
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Paid</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold uppercase">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white mb-0.5">{user.fullName}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {user.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                           <div className="text-slate-300 flex items-center gap-2 mb-1"><Mail className="w-3.5 h-3.5 text-slate-500"/> {user.email}</div>
                           <div className="text-slate-400 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500"/> {user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-300 border border-white/5'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          user.kyc?.status === 'APPROVED' ? 'approved' : 
                          user.kyc?.status === 'REJECTED' ? 'rejected' : 
                          user.kyc?.status === 'PENDING' ? 'pending' : 'proof-uploaded'
                        }>
                          {user.kyc?.status || 'NOT_SUBMITTED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-400">₹{user.totalPaid.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewModal({ open: true, user })}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: user.id, name: user.fullName })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                            title="Delete User"
                            disabled={user.role === 'ADMIN'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* View Modal */}
      <Modal 
        isOpen={viewModal.open} 
        onClose={() => setViewModal({ open: false, user: null })}
        title="User Details"
        size="lg"
      >
        {viewModal.user && (
          <div className="space-y-6">
             <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center text-3xl font-black text-blue-400 uppercase">
                  {viewModal.user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{viewModal.user.fullName}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono">{viewModal.user.id}</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md font-bold">{viewModal.user.role}</span>
                  </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
               <div className="bg-[#111827] p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p>
                 <p className="text-white font-medium">{viewModal.user.email}</p>
               </div>
               <div className="bg-[#111827] p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Phone</p>
                 <p className="text-white font-medium">{viewModal.user.phone}</p>
               </div>
               <div className="bg-[#111827] p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Joined Date</p>
                 <p className="text-white font-medium">{new Date(viewModal.user.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
               </div>
               <div className="bg-[#111827] p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                 <p className="text-emerald-400 font-black text-xl">₹{viewModal.user.totalPaid.toLocaleString('en-IN')}</p>
               </div>
             </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => !actionLoading && setDeleteModal({ open: false, id: '', name: '' })}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-lg text-white font-bold mb-2">Delete {deleteModal.name}?</p>
          <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">This action cannot be undone. All associated data (payments, KYC, etc.) will be permanently removed.</p>
          
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ open: false, id: '', name: '' })}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
              className="flex-1 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
