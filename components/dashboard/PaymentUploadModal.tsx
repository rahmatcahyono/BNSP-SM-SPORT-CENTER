"use client";

import React, { useState, useEffect, useCallback } from "react";
import { uploadPaymentProofAction, checkPaymentStatusAction, simulateWebhookAction } from "@/actions/reservation.actions";
import { useToast } from "@/components/Providers";
import { Building2, QrCode, Copy, CheckCircle2, Timer, Smartphone, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

interface PaymentUploadModalProps {
  reservationId: string;
  invoiceNo: string;
  totalPrice: number;
  courtName: string;
  schedule: string;
  onClose: () => void;
}

export default function PaymentUploadModal({
  reservationId,
  invoiceNo,
  totalPrice,
  courtName,
  schedule,
  onClose,
}: PaymentUploadModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"VA" | "QRIS">("VA");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Generate QRIS dynamic QR code
  const generateQRIS = useCallback(async () => {
    const qrisPayload = `${window.location.origin}/pay/${invoiceNo}`;

    try {
      const url = await QRCode.toDataURL(qrisPayload, {
        width: 280,
        margin: 2,
        color: {
          dark: "#1a1a2e",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  }, [invoiceNo, totalPrice, courtName, schedule]);

  useEffect(() => {
    generateQRIS();
  }, [generateQRIS]);

  // Countdown timer (only for QRIS)
  useEffect(() => {
    if (timeLeft <= 0 || paymentMethod !== "QRIS" || isPaymentSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, paymentMethod, isPaymentSuccess]);

  // Polling Payment Status for QRIS
  useEffect(() => {
    if (paymentMethod !== "QRIS" || isPaymentSuccess) return;

    const pollStatus = async () => {
      const res = await checkPaymentStatusAction(reservationId);
      if (res.success && res.status === "CONFIRMED") {
        setIsPaymentSuccess(true);
        toast("Pembayaran berhasil diverifikasi!", "success");
        // Otomatis refresh list setelah 3 detik
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 3000);
      }
    };

    const intervalId = setInterval(pollStatus, 3000);
    return () => clearInterval(intervalId);
  }, [paymentMethod, isPaymentSuccess, reservationId, router, onClose, toast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 120 && timeLeft > 0;

  const handleCopyVA = () => {
    navigator.clipboard.writeText("8801234567890123");
    setCopied(true);
    toast("Nomor Virtual Account disalin!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    const res = await simulateWebhookAction(invoiceNo, totalPrice);
    if (!res.success) {
      toast(res.error || "Gagal simulasi webhook", "error");
      setIsSimulating(false);
    }
    // Jika sukses, useEffect polling akan menangkap perubahannya secara otomatis
  };

  const eWallets = [
    { name: "GoPay", color: "bg-emerald-500" },
    { name: "OVO", color: "bg-purple-600" },
    { name: "DANA", color: "bg-blue-500" },
    { name: "SPay", color: "bg-orange-500" },
  ];

  if (isPaymentSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 p-8 rounded-3xl shadow-2xl animate-scale-up text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Pembayaran Berhasil! 🎉</h2>
          <p className="text-sm text-gray-500 mb-6">
            Terima kasih, pembayaran untuk Invoice <strong>{invoiceNo}</strong> telah kami terima.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 w-full mb-6">
            <p className="text-xs text-gray-500 mb-1">Total Bayar</p>
            <p className="text-lg font-bold text-gray-800">Rp {Number(totalPrice).toLocaleString("id-ID")}</p>
          </div>
          <p className="text-xs text-emerald-600 font-medium animate-pulse">Menutup otomatis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-0 rounded-2xl shadow-2xl animate-scale-up overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-violet-600 p-5 text-white flex justify-between items-center shrink-0">
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

        <div className="p-6 overflow-y-auto">
          {/* Total Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
            <p className="text-3xl font-black text-gray-800">Rp {Number(totalPrice).toLocaleString("id-ID")}</p>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod("VA")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${paymentMethod === "VA" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Building2 size={16} /> Transfer Bank
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("QRIS")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${paymentMethod === "QRIS" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <QrCode size={16} /> QRIS
            </button>
          </div>

          {/* === TAB: Virtual Account / Transfer Bank === */}
          {paymentMethod === "VA" ? (
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 font-medium mb-2">BCA Virtual Account</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-xl font-bold tracking-widest text-gray-800">8801 2345 6789 0123</p>
                  <button onClick={handleCopyVA} className="text-violet-600 hover:text-violet-700 transition" title="Salin">
                    {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BCA</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 tracking-wider">7890 1234 5678</p>
                    <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BNI</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 tracking-wider">0123 4567 8901</p>
                    <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* === TAB: QRIS Dinamis === */
            <div className="mb-2">

              {/* Countdown Timer */}
              <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl mb-4 text-sm font-bold ${
                isExpired
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : isUrgent
                  ? "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
                <Timer size={16} />
                {isExpired ? (
                  <span className="flex items-center gap-1">
                    <AlertCircle size={14} /> QR Kedaluwarsa — Silakan buat pesanan baru
                  </span>
                ) : (
                  <span>Menunggu pembayaran... {formatTime(timeLeft)}</span>
                )}
              </div>

              {/* Dynamic QRIS QR Code */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center relative overflow-hidden">
                <div className="flex items-center gap-1.5 mb-3">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <p className="text-xs text-gray-500 font-medium">
                    Scan QR Code dengan aplikasi E-Wallet atau M-Banking
                  </p>
                </div>
                
                {qrDataUrl ? (
                  <div className={`bg-white border-2 rounded-2xl p-3 shadow-sm transition relative z-10 ${
                    isExpired ? "border-red-200 opacity-40" : "border-violet-200"
                  }`}>
                    <img
                      src={qrDataUrl}
                      alt={`QRIS ${invoiceNo}`}
                      className="w-52 h-52"
                    />
                  </div>
                ) : (
                  <div className="w-52 h-52 bg-gray-100 rounded-2xl flex items-center justify-center z-10">
                    <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  </div>
                )}

                {/* Scanning animation overlay */}
                {!isExpired && (
                  <div className="absolute top-16 bottom-16 left-1/2 -translate-x-1/2 w-52 pointer-events-none z-20 overflow-hidden rounded-xl">
                     <div className="w-full h-1 bg-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.8)] absolute top-0 animate-scan"></div>
                  </div>
                )}

                {/* QRIS Badge */}
                <div className="mt-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm relative z-10">
                  <QrCode size={14} className="text-violet-600" />
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">QRIS</span>
                </div>

                {/* Detail info */}
                <div className="mt-3 text-center space-y-0.5 relative z-10">
                  <p className="text-xs font-bold text-gray-700">{courtName}</p>
                  <p className="text-[11px] text-gray-500">{schedule}</p>
                </div>
              </div>

              {/* Supported E-Wallets */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {eWallets.map((w) => (
                  <span
                    key={w.name}
                    className={`${w.color} text-white text-[9px] font-bold px-2 py-1 rounded-md`}
                  >
                    {w.name}
                  </span>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mt-4">
                <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1.5">
                  <Smartphone size={14} /> Cara Pembayaran QRIS
                </p>
                <ol className="text-[11px] text-violet-600 space-y-1.5 list-decimal list-inside">
                  <li>Buka aplikasi E-Wallet atau M-Banking Anda</li>
                  <li>Pilih menu <strong>Scan QR / Pay</strong></li>
                  <li>Arahkan kamera ke QR Code di atas</li>
                  <li>Konfirmasi pembayaran (Nominal otomatis terisi)</li>
                  <li>Sistem akan memverifikasi pembayaran Anda otomatis</li>
                </ol>
              </div>
            </div>
          )}

          {/* Upload Payment Proof (Hanya untuk VA/Transfer Bank) */}
          {paymentMethod === "VA" && (
            <div className="border-t border-gray-100 pt-6 mt-6">
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
          )}
        </div>
      </div>
    </div>
  );
}
