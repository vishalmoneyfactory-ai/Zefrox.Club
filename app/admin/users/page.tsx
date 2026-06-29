'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">{users.length} total users</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full sm:w-72 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Name</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Email</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden sm:table-cell">Phone</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">KYC</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden lg:table-cell">Total Paid</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs uppercase text-slate-500 font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{user.phone}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.kyc?.status === 'APPROVED' ? 'approved' : user.kyc?.status === 'REJECTED' ? 'rejected' : 'pending'}>
                      {user.kyc?.status || 'None'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 hidden lg:table-cell">₹{user.totalPaid.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleView(user.id)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button onClick={() => setDeleteUser(user)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewUser || viewLoading} onClose={() => setViewUser(null)} title="User Details" size="xl">
        {viewLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : viewUser ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Name</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{viewUser.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                <p className="text-sm text-slate-900 mt-1">{viewUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Phone</p>
                <p className="text-sm text-slate-900 mt-1">{viewUser.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Total Paid</p>
                <p className="text-sm font-semibold text-green-700 mt-1">₹{viewUser.totalPaid.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">KYC Status</p>
                <Badge variant={viewUser.kyc?.status === 'APPROVED' ? 'approved' : viewUser.kyc?.status === 'REJECTED' ? 'rejected' : 'pending'}>
                  {viewUser.kyc?.status || 'None'}
                </Badge>
              </div>
            </div>

            {viewUser.kyc?.selfieUrl && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">KYC Selfie</p>
                <img src={viewUser.kyc.selfieUrl} alt="KYC Selfie" className="w-24 h-24 rounded-xl object-cover border" />
              </div>
            )}

            {viewUser.payments.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Payments ({viewUser.payments.length})</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 text-slate-500 font-medium">Amount</th>
                        <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                        <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewUser.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2">
                            <Badge variant={p.status === 'APPROVED' ? 'approved' : p.status === 'REJECTED' ? 'rejected' : 'proof-uploaded'}>
                              {p.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-2 text-slate-500">{new Date(p.submittedAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewUser.paymentRequests.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Payment Requests ({viewUser.paymentRequests.length})</p>
                <div className="space-y-1">
                  {viewUser.paymentRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-sm">
                      <span className="font-medium">₹{r.amount.toLocaleString('en-IN')}</span>
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
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              id="edit-name"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="edit-email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              id="edit-phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              {editSaving && <Spinner size="sm" />}
              Save
            </button>
            <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-slate-900 font-medium mb-1">Delete {deleteUser?.fullName}?</p>
          <p className="text-slate-500 text-sm mb-6">This will permanently delete all their data including payments, KYC, and notifications.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              {deleting && <Spinner size="sm" />}
              Delete
            </button>
            <button onClick={() => setDeleteUser(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
