"use client";

import React, { useState } from "react";
import { simulateWebhookAction } from "@/actions/reservation.actions";
import { CheckCircle2, Smartphone } from "lucide-react";

interface PaymentClientProps {
  invoiceNumber: string;
  courtName: string;
  date: string;
  totalPrice: number;
  status: string;
}

export default function PaymentClient({
  invoiceNumber,
  courtName,
  date,
  totalPrice,
  status,
}: PaymentClientProps) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(status === "CONFIRMED");
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateWebhookAction(invoiceNumber, totalPrice);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || "Gagal memproses pembayaran");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center animate-scale-up">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        
        <h2 className="text-2xl font-black text-emerald-800 mb-2 tracking-tight">Pembayaran Sukses!</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">SM Sport Center</p>

        <div className="w-full space-y-4 text-left border-t border-dashed border-gray-200 pt-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">ID Reservasi</span>
            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md text-xs">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Lapangan</span>
            <span className="font-bold text-gray-800">{courtName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-bold text-gray-800">{date}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs tracking-wider">TERBAYAR LUNAS</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
            <span className="text-gray-500 font-medium">Total Harga</span>
            <span className="font-black text-emerald-600 text-lg">Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          Lunas terbayar via QRIS. Layar komputer Anda di lokasi pemesanan akan otomatis diperbarui dan memunculkan E-Tiket dalam waktu singkat. Anda sekarang dapat menutup tab ini.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden p-8 flex flex-col items-center">
      {/* Fake Profile Avatar */}
      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-800 font-black text-xl mb-4">
        SM
      </div>
      
      <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Konfirmasi Pembayaran</h2>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">SM Sport Center</p>

      <div className="w-full space-y-4 text-left border-t border-dashed border-gray-200 pt-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">ID Reservasi</span>
          <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md text-xs">{invoiceNumber}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Lapangan</span>
          <span className="font-bold text-gray-800">{courtName}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-bold text-gray-800">{date}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Metode Pembayaran</span>
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <Smartphone size={14} /> QRIS
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
          <span className="text-gray-500 font-medium">Total Bayar</span>
          <span className="font-black text-indigo-900 text-lg">Rp {totalPrice.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {error && (
        <div className="w-full mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || status !== "PENDING_PAYMENT"}
        className="w-full mt-8 py-4 bg-[#1e204c] hover:bg-[#16173a] text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : status !== "PENDING_PAYMENT" ? (
          "Sudah Dibayar"
        ) : (
          "Bayar Sekarang"
        )}
      </button>

      <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed max-w-[260px]">
        Dengan mengklik tombol, Anda menyatakan setuju melakukan pelunasan biaya sewa lapangan.
      </p>
    </div>
  );
}
