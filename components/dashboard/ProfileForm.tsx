"use client";

import React, { useState, useEffect, useRef } from "react";
import { getProfileAction, updateProfileAction, changePasswordAction, uploadAvatarAction } from "@/actions/profile.actions";
import { useToast } from "@/components/Providers";
import { User, Mail, Phone, Lock, Shield, Calendar, Save, Eye, EyeOff, Upload, Camera } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfileForm() {
  const { toast } = useToast();
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getProfileAction();
      if (res.success && res.user) {
        setName(res.user.name);
        setEmail(res.user.email);
        setPhone(res.user.phoneNumber || "");
        setRole(res.user.role);
        setAvatar(res.user.image || null);
        setCreatedAt(new Date(res.user.createdAt).toLocaleDateString("id-ID", {
          year: "numeric", month: "long", day: "numeric",
        }));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return toast("Nama tidak boleh kosong.", "error");
    if (name.length > 32) return toast("Nama maksimal 32 karakter.", "error");
    setSaving("name");
    const res = await updateProfileAction({ name });
    toast(res.success ? res.message! : res.error!, res.success ? "success" : "error");
    setSaving(null);
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) return toast("Email tidak boleh kosong.", "error");
    setSaving("email");
    const res = await updateProfileAction({ email });
    toast(res.success ? res.message! : res.error!, res.success ? "success" : "error");
    setSaving(null);
  };

  const handleSavePhone = async () => {
    setSaving("phone");
    const res = await updateProfileAction({ phoneNumber: phone || undefined });
    toast(res.success ? res.message! : res.error!, res.success ? "success" : "error");
    setSaving(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast("Password baru dan konfirmasi tidak cocok.", "error");
    }
    setSaving("password");
    const res = await changePasswordAction({ currentPassword, newPassword });
    if (res.success) {
      toast(res.message!, "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast(res.error!, "error");
    }
    setSaving(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast("Hanya file gambar yang diperbolehkan.", "error");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast("Ukuran gambar maksimal 5MB.", "error");
    }

    setSaving("avatar");
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAvatarAction(formData);
    if (res.success && res.url) {
      setAvatar(res.url);
      await updateSession({ image: res.url });
      toast(res.message!, "success");
    } else {
      toast(res.error!, "error");
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <span className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="space-y-0">

      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 rounded-t-2xl p-8 text-white">
        <h1 className="text-2xl font-black">Pengaturan Akun</h1>
        <p className="text-white/70 text-sm mt-1">Kelola akun dan informasi pribadi Anda.</p>
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-b-2xl shadow-sm">

        {/* Avatar Section */}
        <div className="px-8 py-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Avatar Anda</h3>
            <p className="text-sm text-gray-500 mt-0.5">Pilih foto profil yang merepresentasikan Anda.</p>
          </div>
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            {avatar ? (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-violet-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-400 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-violet-200">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {saving === "avatar" ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Role & Member Since */}
        <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
              <p className="text-sm font-bold text-gray-800">{role === "ADMIN" ? "Administrator" : "Customer"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Bergabung Sejak</p>
              <p className="text-sm font-bold text-gray-800">{createdAt}</p>
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div className="px-8 py-7 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="sm:w-1/3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><User size={16} /> Nama Anda</h3>
            <p className="text-sm text-gray-500 mt-0.5">Masukkan nama tampilan Anda. Maks 32 karakter.</p>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              placeholder="Masukkan nama Anda"
            />
            <button
              onClick={handleSaveName}
              disabled={saving === "name"}
              className="px-5 py-2.5 text-sm font-bold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {saving === "name" ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Save size={14} />}
              Simpan
            </button>
          </div>
        </div>

        {/* Email Field */}
        <div className="px-8 py-7 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="sm:w-1/3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><Mail size={16} /> Email Anda</h3>
            <p className="text-sm text-gray-500 mt-0.5">Masukkan alamat email utama Anda.</p>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              placeholder="Masukkan email Anda"
            />
            <button
              onClick={handleSaveEmail}
              disabled={saving === "email"}
              className="px-5 py-2.5 text-sm font-bold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {saving === "email" ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Save size={14} />}
              Simpan
            </button>
          </div>
        </div>

        {/* Phone Field */}
        <div className="px-8 py-7 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="sm:w-1/3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><Phone size={16} /> Nomor HP</h3>
            <p className="text-sm text-gray-500 mt-0.5">Opsional. Digunakan untuk notifikasi pemesanan.</p>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              placeholder="08xxxxxxxxxx"
            />
            <button
              onClick={handleSavePhone}
              disabled={saving === "phone"}
              className="px-5 py-2.5 text-sm font-bold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {saving === "phone" ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Save size={14} />}
              Simpan
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="px-8 py-7">
          <div className="mb-5">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><Lock size={16} /> Ubah Password</h3>
            <p className="text-sm text-gray-500 mt-0.5">Untuk keamanan, masukkan password lama lalu buat password baru.</p>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition pr-12"
                placeholder="Password lama"
                required
              />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition pr-12"
                placeholder="Password baru (min 6 karakter)"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              placeholder="Konfirmasi password baru"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={saving === "password"}
              className="px-6 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-md shadow-violet-200"
            >
              {saving === "password" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={14} />}
              Ubah Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
