"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/Providers";
import { createVoucherAction, deleteVoucherAction, toggleVoucherStatusAction } from "@/actions/voucher.actions";

export default function VoucherManager({ initialVouchers = [] }: { initialVouchers?: any[] }) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"NOMINAL" | "PERCENTAGE">("NOMINAL");
  const [discountNominal, setDiscountNominal] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !maxUses) return;
    if (discountType === "NOMINAL" && !discountNominal) return;
    if (discountType === "PERCENTAGE" && !discountPercent) return;

    setIsSubmitting(true);
    const result = await createVoucherAction({
      code,
      discountType,
      discountNominal: discountType === "NOMINAL" ? Number(discountNominal) : undefined,
      discountPercent: discountType === "PERCENTAGE" ? Number(discountPercent) : undefined,
      maxUses: Number(maxUses),
    });
    setIsSubmitting(false);

    if (result.success) {
      toast(result.message || "Berhasil ditambahkan", "success");
      setCode("");
      setDiscountNominal("");
      setDiscountPercent("");
      setMaxUses("");
      // Real app might fetch updated list or mutate via SWR/React Query.
      // We will rely on router refresh from parent if needed, or optimistic UI.
      window.location.reload();
    } else {
      toast(result.error || "Gagal menambahkan voucher", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher ini?")) return;
    
    const result = await deleteVoucherAction(id);
    if (result.success) {
      toast(result.message || "Berhasil dihapus", "success");
      setVouchers(vouchers.filter(v => v.id !== id));
    } else {
      toast(result.error || "Gagal menghapus voucher", "error");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleVoucherStatusAction(id, !currentStatus);
    if (result.success) {
      toast(result.message || "Status diubah", "success");
      setVouchers(vouchers.map(v => v.id === id ? { ...v, isActive: !currentStatus } : v));
    } else {
      toast(result.error || "Gagal mengubah status", "error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Kelola Voucher Diskon</h3>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Kode Voucher</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Misal: MERDEKA50"
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipe Diskon</label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "NOMINAL" | "PERCENTAGE")}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          >
            <option value="NOMINAL">Nominal (Rp)</option>
            <option value="PERCENTAGE">Persentase (%)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {discountType === "NOMINAL" ? "Potongan Harga (Rp)" : "Potongan Persen (%)"}
          </label>
          <input
            type="number"
            required
            min="0"
            max={discountType === "PERCENTAGE" ? "100" : undefined}
            value={discountType === "NOMINAL" ? discountNominal : discountPercent}
            onChange={(e) => discountType === "NOMINAL" ? setDiscountNominal(e.target.value) : setDiscountPercent(e.target.value)}
            placeholder={discountType === "NOMINAL" ? "Misal: 25000" : "Misal: 10"}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Kuota Penggunaan</label>
          <input
            type="number"
            required
            min="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Misal: 10"
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-4 py-2 transition disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Tambah
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Potongan</th>
              <th className="px-4 py-3 text-center">Kuota Terpakai</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-bold text-gray-900">{v.code}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">
                  {v.discountType === "PERCENTAGE" 
                    ? `${v.discountPercent}%` 
                    : `Rp ${Number(v.discountNominal).toLocaleString('id-ID')}`}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v.usedCount >= v.maxUses ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {v.usedCount} / {v.maxUses}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(v.id, v.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${v.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  >
                    {v.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Belum ada kode voucher yang dibuat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
