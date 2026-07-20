"use client";

import React, { useState } from "react";
import { signUpAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Providers";
import Link from "next/link";
import { RegisterSchema } from "@/lib/validations";
import { Eye, EyeOff, Activity } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side Validation
    const validationResult = RegisterSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await signUpAction(formData);

      if (res.success) {
        toast(res.message || "Pendaftaran sukses!", "success");
        router.push("/login");
      } else {
        toast(res.error || "Gagal mendaftar", "error");
      }
    } catch (err: any) {
      toast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5fb] px-4 py-10">
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
          <h1 className="text-2xl font-bold text-gray-800">Daftar Sekarang 🚀</h1>
          <p className="text-sm text-violet-500 font-medium mt-1">Bergabung dan mulai reservasi lapangan olahraga!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
              placeholder="Nama Anda"
            />
            {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
              placeholder="nama@email.com"
            />
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon / WA</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
              placeholder="0812xxxxxxxx"
            />
            {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
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
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" required id="agree" className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
            <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer select-none">
              Saya setuju dengan{" "}
              <span className="text-violet-600 font-medium">syarat & ketentuan</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-violet-200 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
}
