"use client";

import React, { useState } from "react";
import { uploadPaymentProofAction } from "@/actions/reservation.actions";
import { useToast } from "@/components/Providers";
import { Building2, QrCode, Copy, CheckCircle2 } from "lucide-react";

interface PaymentUploadModalProps {
  reservationId: string;
  invoiceNo: string;
  totalPrice: number;
  onClose: () => void;
}

export default function PaymentUploadModal({
  reservationId,
  invoiceNo,
  totalPrice,
  onClose,
}: PaymentUploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"VA" | "QRIS">("VA");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText("8801234567890123");
    setCopied(true);
    toast("Nomor Virtual Account disalin!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast("Silakan pilih file bukti pembayaran terlebih dahulu.", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("reservationId", reservationId);
    formData.append("file", file);

    try {
      const res = await uploadPaymentProofAction(formData);

      if (res.success) {
        toast(res.message, "success");
        onClose();
      } else {
        toast(res.error || "Gagal mengunggah bukti pembayaran.", "error");
      }
    } catch (err: any) {
      toast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-0 rounded-2xl shadow-2xl animate-scale-up overflow-hidden">
        
        <div className="bg-violet-600 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Selesaikan Pembayaran</h3>
            <p className="text-violet-200 text-xs mt-0.5">Invoice: {invoiceNo}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
            <p className="text-3xl font-black text-gray-800">Rp {Number(totalPrice).toLocaleString("id-ID")}</p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod("VA")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${paymentMethod === "VA" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Building2 size={16} /> Virtual Account
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("QRIS")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${paymentMethod === "QRIS" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <QrCode size={16} /> QRIS
            </button>
          </div>

          {paymentMethod === "VA" ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-xs text-gray-500 font-medium mb-2">BCA Virtual Account</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-xl font-bold tracking-widest text-gray-800">8801 2345 6789 0123</p>
                <button onClick={handleCopyVA} className="text-violet-600 hover:text-violet-700 transition" title="Salin">
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex flex-col items-center">
              <p className="text-xs text-gray-500 font-medium mb-3">Scan QR Code dengan aplikasi m-Banking/E-Wallet</p>
              <div className="w-32 h-32 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-2">
                {/* Mockup QRIS image */}
                <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover bg-center opacity-80" />
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-bold text-gray-800 mb-3">Upload Bukti Transfer</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition relative ${file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-violet-500 bg-gray-50'}`}>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  {file ? (
                    <>
                      <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-600">Klik atau seret gambar bukti bayar</p>
                      <p className="text-xs text-gray-400">Format: JPG, JPEG, PNG (Maks. 2MB)</p>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition disabled:opacity-50 disabled:bg-gray-300 flex justify-center items-center gap-2 shadow-lg shadow-violet-200"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Kirim Bukti Pembayaran"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
