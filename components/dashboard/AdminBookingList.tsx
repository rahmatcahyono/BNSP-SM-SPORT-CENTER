"use client";

import React, { useState } from "react";
import { reviewReservationAction } from "@/actions/reservation.actions";
import { useToast } from "@/components/Providers";
import { Check, X, Printer } from "lucide-react";

interface Booking {
  id: string;
  invoiceNumber: string;
  date: string;
  startTime: number;
  durationHours: number;
  totalPrice: number;
  status: string;
  paymentProof: string | null;
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  court: {
    name: string;
    type: string;
  };
}

export default function AdminBookingList({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Apakah Anda yakin ingin ${status === "APPROVED" ? "menyetujui" : "menolak"} booking ini?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await reviewReservationAction({ reservationId: id, status });

      if (res.success) {
        toast(res.message, "success");
      } else {
        toast(res.error || "Gagal memperbarui reservasi.", "error");
      }
    } catch (err: any) {
      toast("Terjadi kesalahan sistem.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-amber-50 text-amber-700 border border-amber-200 font-semibold";
      case "AWAITING_REVIEW":
        return "bg-blue-50 text-blue-700 border border-blue-200 font-semibold";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold";
      case "CANCELED":
        return "bg-red-50 text-red-700 border border-red-200 font-semibold";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "Belum Bayar";
      case "AWAITING_REVIEW":
        return "Butuh Review";
      case "CONFIRMED":
        return "Disetujui";
      case "CANCELED":
        return "Ditolak";
      default:
        return status;
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider bg-gray-50">
              <th className="p-4">Customer</th>
              <th className="p-4">Lapangan</th>
              <th className="p-4">Waktu</th>
              <th className="p-4">Total</th>
              <th className="p-4">Bukti</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400">
                  Belum ada transaksi pemesanan masuk.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Customer details */}
                  <td className="p-4">
                    <span className="font-bold block text-gray-800">{booking.user.name}</span>
                    <span className="text-xs text-gray-400 block">{booking.user.email}</span>
                    <span className="text-xs text-gray-400 block">{booking.user.phoneNumber}</span>
                  </td>

                  {/* Court details */}
                  <td className="p-4">
                    <span className="font-semibold block text-gray-700">
                      {booking.court.name}
                    </span>
                    <span className="text-xs text-blue-500 uppercase font-medium">
                      {booking.court.type}
                    </span>
                  </td>

                  {/* Date and time */}
                  <td className="p-4">
                    <span className="block text-gray-700 font-medium">
                      {new Date(booking.date).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-gray-400">
                      Pukul {booking.startTime}:00 - {booking.startTime + booking.durationHours}:00
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-bold text-gray-800">
                    Rp {Number(booking.totalPrice).toLocaleString("id-ID")}
                  </td>

                  {/* Payment proof thumbnail */}
                  <td className="p-4">
                    {booking.paymentProof ? (
                      <button
                        onClick={() => setActiveImage(booking.paymentProof)}
                        className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-medium rounded-lg transition"
                      >
                        Lihat Gambar
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Tidak ada</span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    {booking.status === "AWAITING_REVIEW" ? (
                      <div className="flex flex-col gap-2 w-full max-w-[120px] ml-auto">
                        <button
                          onClick={() => handleReview(booking.id, "APPROVED")}
                          disabled={actionLoadingId === booking.id}
                          className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Check size={14} />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReview(booking.id, "REJECTED")}
                          disabled={actionLoadingId === booking.id}
                          className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <X size={14} />
                          Tolak
                        </button>
                      </div>
                    ) : booking.status === "CONFIRMED" ? (
                      <div className="flex flex-col gap-2 w-full max-w-[120px] ml-auto">
                        <span className="text-gray-400 text-xs italic block text-center mb-1">Telah ditinjau</span>
                        <a
                          href={`/invoice/${booking.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Printer size={14} />
                          Cetak Struk
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic block text-right">Telah ditinjau</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox Modal for Payment Proof Inspection */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <img
              src={activeImage}
              alt="Bukti Transfer Pembayaran"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 p-2 rounded-full text-white/80 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
