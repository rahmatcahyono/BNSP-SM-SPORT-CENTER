import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourtRepository } from "@/repositories/court.repository";
import { serializeForClient } from "@/lib/serialize";
import CourtManager from "@/components/dashboard/CourtManager";

export default async function AdminCourtsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const courts = await CourtRepository.findAll();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Kelola Lapangan Olahraga</h2>
        <p className="text-sm text-slate-400 mt-1">
          Tambahkan, perbarui, aktifkan/nonaktifkan, atau hapus daftar lapangan futsal dan badminton SM Sport Center.
        </p>
      </div>

      <CourtManager initialCourts={serializeForClient(courts) as any} />
    </div>
  );
}
