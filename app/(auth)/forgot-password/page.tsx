"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Providers";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth.actions";
import { Eye, EyeOff, Activity, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newPassword.length < 6) {
        toast("Password minimal 6 karakter.", "error");
        setLoading(false);
        return;
      }

      const res = await resetPasswordAction(email, newPassword);

      if (res.success) {
        toast(res.message, "success");
        router.push("/login");
      } else {
        toast(res.error, "error");
      }
    } catch (err: any) {
      toast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5fb] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-200">
            <Activity size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">SM Sport Center</span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={20} className="text-violet-500" />
            <h1 className="text-2xl font-bold text-gray-800">Reset Password 🔐</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan email dan password baru Anda untuk mengatur ulang akses akun.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Minimal 6 karakter dan tidak boleh sama dengan password lama.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-violet-200 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Ganti Password"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Ingat password Anda?{" "}
          <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
