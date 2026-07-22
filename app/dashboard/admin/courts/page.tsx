import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourtRepository } from "@/repositories/court.repository";
import { serializeForClient } from "@/lib/serialize";
import CourtManager from "@/components/dashboard/CourtManager";
import CourtMonitoring from "@/components/dashboard/CourtMonitoring";
import VoucherManager from "@/components/dashboard/VoucherManager";
import { prisma } from "@/lib/prisma";
import { format, parseISO, isValid } from "date-fns";

export default async function AdminCourtsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const courts = await CourtRepository.findAll();
  
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Determine the date to query (default to today)
  let targetDate = new Date();
  if (params.date) {
    const parsed = parseISO(params.date);
    if (isValid(parsed)) {
      targetDate = parsed;
    }
  }

  // Normalize to local date (strip time) for accurate querying
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch reservations for the target date that are NOT canceled
  const reservations = await prisma.reservation.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: "CANCELED",
      },
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Kelola & Monitoring Lapangan</h2>
        <p className="text-sm text-slate-400 mt-1">
          Pantau ketersediaan lapangan secara real-time, serta tambahkan, perbarui, atau hapus daftar lapangan SM Sport Center.
        </p>
      </div>

      <CourtMonitoring
        courts={serializeForClient(courts) as any}
        reservations={serializeForClient(reservations) as any}
        currentDate={format(targetDate, "yyyy-MM-dd")}
      />

      <div className="border-t border-slate-800 pt-8 mt-8">
        <h3 className="text-xl font-bold text-slate-100 mb-4">Manajemen Data Lapangan</h3>
        <CourtManager initialCourts={serializeForClient(courts) as any} />
      </div>

      <div className="border-t border-slate-800 pt-8 mt-8">
        <h3 className="text-xl font-bold text-slate-100 mb-4">Manajemen Voucher Diskon</h3>
        <VoucherManager initialVouchers={serializeForClient(vouchers) as any} />
      </div>
    </div>
  );
}
