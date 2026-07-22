import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReservationRepository } from "@/repositories/reservation.repository";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import CourtAvailabilityGrid from "@/components/dashboard/CourtAvailabilityGrid";

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  // Fetch active announcements
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Halo, {session.user.name}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selamat datang di Dashboard Member SM Sport Center.
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
          
          <CourtAvailabilityGrid />

        </div>

        {/* Kolom Kanan - Sidebar / Widgets (30%) */}
        <div className="space-y-6">
          
          {/* Announcements Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-amber-500" />
              <h3 className="font-bold text-gray-800 text-sm">PENGUMUMAN</h3>
            </div>
            
            {announcements.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">Belum ada pengumuman saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => {
                  let styleClass = "";
                  switch (item.type) {
                    case "INFO": styleClass = "bg-blue-50 border-blue-100 text-blue-800 text-blue-700"; break;
                    case "WARNING": styleClass = "bg-amber-50 border-amber-100 text-amber-800 text-amber-700"; break;
                    case "PROMO": styleClass = "bg-emerald-50 border-emerald-100 text-emerald-800 text-emerald-700"; break;
                  }
                  return (
                    <div key={item.id} className={`p-3 rounded-xl border ${styleClass.split(' ').slice(0,2).join(' ')}`}>
                      <p className={`text-xs font-bold mb-1 ${styleClass.split(' ')[2]}`}>
                        {item.title} {item.type === "PROMO" && "🎁"}
                      </p>
                      <p className={`text-[11px] leading-relaxed ${styleClass.split(' ')[3]}`}>
                        {item.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
