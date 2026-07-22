import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReservationRepository } from "@/repositories/reservation.repository";
import { serializeForClient } from "@/lib/serialize";
import CustomerBookingList from "@/components/dashboard/CustomerBookingList";
import Link from "next/link";
import { CalendarDays, CheckCircle, Clock, ListChecks, Plus, QrCode, MapPin, ArrowRight } from "lucide-react";

export default async function CustomerBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const bookings = await ReservationRepository.findByCustomerId(session.user.id);

  // Statistics
  const activeBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingReviews = bookings.filter((b) => b.status === "AWAITING_REVIEW").length;

  // Get nearest upcoming booking
  const upcomingBookings = bookings
    .filter((b) => b.status === "CONFIRMED" && new Date(b.date).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextMatch = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  const stats = [
    { label: "Total Booking", value: bookings.length, icon: ListChecks, color: "blue", bg: "bg-blue-50", text: "text-blue-700", iconColor: "text-blue-500" },
    { label: "Dikonfirmasi", value: activeBookings, icon: CheckCircle, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-700", iconColor: "text-emerald-500" },
    { label: "Menunggu Tinjauan", value: pendingReviews, icon: Clock, color: "amber", bg: "bg-amber-50", text: "text-amber-700", iconColor: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Riwayat Pemesanan 📋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status pembayaran dan tiket Anda di sini.
          </p>
        </div>
        <Link
          href="/dashboard/customer/reservation"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition duration-200 shadow-md shadow-violet-200 whitespace-nowrap"
        >
          <Plus size={16} />
          Pesan Lapangan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri - Main Content (70%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                    <Icon size={20} className={s.iconColor} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    <p className={`text-2xl font-black mt-0.5 ${s.text}`}>{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking History */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
            <CustomerBookingList bookings={serializeForClient(bookings) as any} />
          </div>
        </div>

        {/* Kolom Kanan - Sidebar / Widgets (30%) */}
        <div className="space-y-6">
          
          {/* Upcoming Booking Card */}
          {nextMatch ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-violet-600 p-4 text-white flex items-center gap-3">
                <CalendarDays size={20} className="text-violet-200" />
                <h3 className="font-bold text-sm tracking-wide">JADWAL MAIN MENDATANG</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex flex-col items-center justify-center text-violet-700">
                    <span className="text-[10px] font-bold uppercase">{new Date(nextMatch.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none">{new Date(nextMatch.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{nextMatch.court.name}</h4>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      Pukul {nextMatch.startTime}:00 - {nextMatch.startTime + nextMatch.durationHours}:00
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Total Biaya</p>
                  <p className="font-black text-gray-800">Rp {Number(nextMatch.totalPrice).toLocaleString("id-ID")}</p>
                </div>
                <button className="w-full bg-gray-900 hover:bg-black text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md">
                  <QrCode size={16} />
                  Tampilkan QR Code
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays size={20} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Belum Ada Jadwal</h3>
              <p className="text-xs text-gray-500 mb-4">Anda belum memiliki jadwal main yang aktif dalam waktu dekat.</p>
              <Link href="/dashboard/customer/reservation" className="inline-flex items-center justify-center w-full py-2.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-xl transition">
                Cari Lapangan Sekarang
              </Link>
            </div>
          )}

          {/* Recommended Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-emerald-500" />
              <h3 className="font-bold text-gray-800 text-sm">LAPANGAN FAVORIT</h3>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50 transition group cursor-pointer">
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-violet-700 transition">Lapangan Futsal 1</p>
                <p className="text-[10px] text-gray-500">Indoor • Rp 150.000/Jam</p>
              </div>
              <Link href="/dashboard/customer/reservation" className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-violet-600 group-hover:border-violet-300 transition shadow-sm">
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
