"use client";

import React, { useState, useEffect } from "react";
import { getUsersAction, createUserAction, updateUserAction, deleteUserAction } from "@/actions/user.actions";
import { useToast } from "@/components/Providers";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "CUSTOMER" as "ADMIN" | "CUSTOMER",
    password: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getUsersAction();
    if (res.success && res.users) {
      setUsers(res.users as User[]);
    } else {
      toast(res.error || "Gagal memuat daftar user.", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      role: "CUSTOMER",
      password: "",
    });
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      password: "", // blank, optional for edit
    });
    setEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserAction(formData);
      if (res.success) {
        toast(res.message, "success");
        setAddModalOpen(false);
        fetchUsers();
      } else {
        toast(res.error || "Gagal membuat user.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await updateUserAction(selectedUser.id, formData);
      if (res.success) {
        toast(res.message, "success");
        setEditModalOpen(false);
        fetchUsers();
      } else {
        toast(res.error || "Gagal memperbarui user.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    try {
      const res = await deleteUserAction(selectedUser.id);
      if (res.success) {
        toast(res.message, "success");
        setDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast(res.error || "Gagal menghapus user.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola User</h2>
          <p className="text-sm text-gray-500 mt-1">Tambah, edit, dan hapus pengguna sistem.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-violet-500/20"
        >
          <Plus size={18} />
          Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-sm font-medium text-gray-500">Memuat data user...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Belum ada data user.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs font-bold uppercase text-gray-500 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">No. Telepon</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Dibuat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-500">{user.phoneNumber || "-"}</td>
                    <td className="px-6 py-4">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-200">
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-200">
                          CUSTOMER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-gray-400 hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(user)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Tambah User Baru</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">No. Telepon</label>
                <input
                  type="text"
                  placeholder="Opsional"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-500/20"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Edit Data User</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">No. Telepon</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganti Sandi (Opsional)</label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak diubah"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-500/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-center">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-400">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hapus User</h3>
            <p className="text-sm text-slate-400 mb-8">
              Apakah Anda yakin ingin menghapus user <strong className="text-white">{selectedUser.name}</strong>? Tindakan ini tidak dapat dikembalikan.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-400 transition shadow-lg shadow-rose-500/20 flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
