"use client";

import React, { useState } from "react";
import PaymentUploadModal from "./PaymentUploadModal";
import { Printer, RefreshCw, QrCode, Wallet } from "lucide-react";
import Link from "next/link";
import { useToast } from "../Providers";

interface Booking {
  id: string;
  invoiceNumber: string;
  date: string;
  startTime: number;
  durationHours: number;
  totalPrice: number;
  status: string;
  paymentProof: string | null;
  court: {
    id: string;
    name: string;
    type: string;
  };
}

export default function CustomerBookingList({ bookings }: { bookings: Booking[] }) {
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; invoiceNumber: string; totalPrice: number; courtName: string; schedule: string } | null>(null);
  const { toast } = useToast();

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "AWAITING_REVIEW":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "CANCELED":
        return "bg-rose-50 text-rose-600 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "Belum Bayar";
      case "AWAITING_REVIEW":
        return "Menunggu Tinjauan";
      case "CONFIRMED":
        return "Disetujui";
      case "CANCELED":
        return "Ditolak";
      default:
        return status;
    }
  };

  const handlePrint = (bookingId: string) => {
    window.open(`/dashboard/customer/invoice/${bookingId}`, "_blank");
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider bg-gray-50">
              <th className="p-4">No. Invoice</th>
              <th className="p-4">Lapangan</th>
              <th className="p-4">Tanggal & Jam</th>
              <th className="p-4">Total Biaya</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Anda belum memiliki riwayat pemesanan lapangan.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-800">{booking.invoiceNumber}</td>
                  <td className="p-4">
                    <span className="font-bold block text-gray-800">
                      {booking.court.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {booking.court.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium text-gray-800">
                      {new Date(booking.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      Pukul {booking.startTime}:00 - {booking.startTime + booking.durationHours}:00 ({booking.durationHours} Jam)
                    </span>
                  </td>
                  <td className="p-4 font-black text-emerald-600">
                    Rp {Number(booking.totalPrice).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === "PENDING_PAYMENT" && (
                        <button
                          onClick={() => setSelectedBooking({
                            id: booking.id,
                            invoiceNumber: booking.invoiceNumber,
                            totalPrice: booking.totalPrice,
                            courtName: booking.court.name,
                            schedule: `${new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • ${booking.startTime}:00 - ${booking.startTime + booking.durationHours}:00`,
                          })}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm shadow-violet-200 transition flex items-center gap-1.5"
                        >
                          <Wallet size={14} /> Selesaikan Pembayaran
                        </button>
                      )}
                      
                      {booking.status === "AWAITING_REVIEW" && (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          Sedang diproses
                        </span>
                      )}
                      
                      {booking.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() => handlePrint(booking.id)}
                            title="Cetak Invoice"
                            className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition"
                          >
                            <Printer size={16} />
                          </button>
                          <Link
                            href="/dashboard/customer/reservation"
                            title="Pesan Lagi"
                            className="p-1.5 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200 transition"
                          >
                            <RefreshCw size={16} />
                          </Link>
                          <button
                            title="Lihat Tiket"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-lg shadow-sm transition"
                          >
                            <QrCode size={14} /> Tiket
                          </button>
                        </>
                      )}
                      
                      {booking.status === "CANCELED" && (
                        <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                          Batal
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <PaymentUploadModal
          reservationId={selectedBooking.id}
          invoiceNo={selectedBooking.invoiceNumber}
          totalPrice={selectedBooking.totalPrice}
          courtName={selectedBooking.courtName}
          schedule={selectedBooking.schedule}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
