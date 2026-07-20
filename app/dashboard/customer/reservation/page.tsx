import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourtRepository } from "@/repositories/court.repository";
import { serializeForClient } from "@/lib/serialize";
import BookingWizard from "@/components/reservation/BookingWizard";

export default async function ReservationPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const courts = await CourtRepository.findAllActive();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Sistem Reservasi Lapangan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih lapangan olahraga, tanggal main, dan jam yang Anda inginkan.
        </p>
      </div>

      <BookingWizard courts={serializeForClient(courts) as any} />
    </div>
  );
}
