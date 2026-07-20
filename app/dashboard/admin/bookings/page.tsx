import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReservationRepository } from "@/repositories/reservation.repository";
import { serializeForClient } from "@/lib/serialize";
import AdminBookingList from "@/components/dashboard/AdminBookingList";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const bookings = await ReservationRepository.findAll();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Review Pemesanan & Pembayaran</h2>
        <p className="text-sm text-gray-500 mt-1">
          Daftar seluruh transaksi reservasi masuk. Setujui atau tolak reservasi yang telah mengunggah bukti pembayaran.
        </p>
      </div>

      <AdminBookingList bookings={serializeForClient(bookings) as any} />
    </div>
  );
}
