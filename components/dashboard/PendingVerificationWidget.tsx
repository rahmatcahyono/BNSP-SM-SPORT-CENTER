"use client";

import React, { useState } from "react";
import { reviewReservationAction } from "@/actions/reservation.actions";
import { useToast } from "@/components/Providers";
import { Check, X, Eye, ShieldAlert, FileText } from "lucide-react";
import Image from "next/image";

type PendingBooking = {
  id: string;
  invoiceNumber: string;
  paymentProof: string | null;
  totalPrice: any;
  user: { name: string; email: string };
  court: { name: string };
  createdAt: Date;
};

interface PendingVerificationWidgetProps {
  bookings: PendingBooking[];
}

export default function PendingVerificationWidget({ bookings }: PendingVerificationWidgetProps) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    const res = await reviewReservationAction({ reservationId: id, status });
    
    if (res.success) {
      toast(`Reservasi berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}.`, "success");
      // Since this is a server component wrapper, revalidatePath in action will refresh data
    } else {
      toast(res.error || "Gagal memproses reservasi", "error");
    }
    setProcessingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm shadow-rose-50 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 flex items-center gap-3 text-white">
        <ShieldAlert size={20} />
        <div>
          <h2 className="text-base font-bold">Butuh Verifikasi Segera</h2>
          <p className="text-xs text-rose-100">Pembayaran masuk menunggu konfirmasi admin</p>
        </div>
        <div className="ml-auto bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">
          {bookings.length} Antrean
        </div>
      </div>

      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <FileText size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium">Semua sudah terverifikasi.</p>
            <p className="text-xs">Tidak ada antrean pembayaran saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-gray-50 transition flex gap-4">
                {/* Thumbnail */}
                <div 
                  className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 cursor-pointer overflow-hidden group relative"
                  onClick={() => booking.paymentProof && setPreviewImage(booking.paymentProof)}
                >
                  {booking.paymentProof ? (
                    <>
                      <img src={booking.paymentProof} alt="Bukti" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Eye size={16} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-gray-500">{booking.invoiceNumber}</p>
                    <span className="text-xs font-black text-rose-600">
                      Rp {Number(booking.totalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 truncate">{booking.user.name}</p>
                  <p className="text-xs text-gray-500 truncate mb-3">{booking.court.name}</p>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(booking.id, "APPROVED")}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      {processingId === booking.id ? <span className="animate-spin text-emerald-500">⏳</span> : <Check size={14} />} Setujui
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, "REJECTED")}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      {processingId === booking.id ? <span className="animate-spin text-rose-500">⏳</span> : <X size={14} />} Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-screen">
            <button className="absolute -top-12 right-0 text-white hover:text-gray-300">
              <X size={32} />
            </button>
            <img src={previewImage} alt="Bukti Transfer" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
