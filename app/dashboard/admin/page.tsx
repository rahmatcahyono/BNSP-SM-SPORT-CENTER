import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReservationRepository } from "@/repositories/reservation.repository";
import { CalendarRange, DollarSign, Users, Activity, ArrowUpRight, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import AdminAnalytics from "@/components/dashboard/AdminAnalytics";
import LiveCourtStatus from "@/components/dashboard/LiveCourtStatus";
import PendingVerificationWidget from "@/components/dashboard/PendingVerificationWidget";
import WalkInModalTrigger from "@/components/dashboard/WalkInModalTrigger";
import AnnouncementManager from "@/components/dashboard/AnnouncementManager";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [stats, recentLogs, analytics, liveCourts, pendingReviewsData, announcements] = await Promise.all([
    ReservationRepository.getStats(),
    ReservationRepository.getRecentLogs(10),
    ReservationRepository.getDashboardAnalytics(),
    ReservationRepository.getLiveCourtStatus(),
    ReservationRepository.getPendingVerifications(5),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const kpiCards = [
    {
      label: "Total Pendapatan",
      value: `Rp ${Number(stats.totalRevenue).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "green",
      href: null,
      sub: "dari booking dikonfirmasi",
      trend: "+12.5%",
      trendUp: true,
      sparkline: "M 0 20 Q 10 10 20 25 T 40 10 T 60 15 T 80 5 T 100 20",
    },
    {
      label: "Butuh Tinjauan",
      value: stats.pendingReviews,
      icon: Clock,
      color: "orange",
      href: "/dashboard/admin/bookings",
      sub: "pembayaran masuk",
      trend: "+2",
      trendUp: false,
      sparkline: "M 0 25 Q 15 25 25 15 T 45 20 T 60 5 T 85 10 T 100 25",
    },
    {
      label: "Total Booking",
      value: stats.totalBookings,
      icon: CalendarRange,
      color: "blue",
      href: null,
      sub: "semua status",
      trend: "+8.2%",
      trendUp: true,
      sparkline: "M 0 10 Q 15 20 30 10 T 50 25 T 70 5 T 85 15 T 100 10",
    },
    {
      label: "Lapangan Aktif",
      value: stats.activeCourts,
      icon: Activity,
      color: "violet",
      href: "/dashboard/admin/courts",
      sub: "siap dioperasikan",
      trend: "0%",
      trendUp: true,
      sparkline: "M 0 15 L 100 15",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string; badge: string; trendColor: string }> = {
    green:  { bg: "bg-green-50", icon: "text-green-600", text: "text-green-700", badge: "bg-green-100 text-green-700", trendColor: "text-emerald-500 bg-emerald-50" },
    orange: { bg: "bg-orange-50", icon: "text-orange-500", text: "text-orange-600", badge: "bg-orange-100 text-orange-600", trendColor: "text-rose-500 bg-rose-50" },
    blue:   { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", trendColor: "text-emerald-500 bg-emerald-50" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", text: "text-violet-700", badge: "bg-violet-100 text-violet-700", trendColor: "text-emerald-500 bg-emerald-50" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Control Panel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau performa bisnis, reservasi masuk, dan status operasional lapangan.
          </p>
        </div>
        <WalkInModalTrigger />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          const content = (
            <>
              {/* Sparkline Background */}
              <svg className="absolute bottom-0 left-0 w-full h-16 opacity-10 group-hover:opacity-20 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d={card.sparkline} fill="none" stroke="currentColor" strokeWidth="2" className={c.text} />
                <path d={`${card.sparkline} L 100 30 L 0 30 Z`} fill="currentColor" stroke="none" className={c.text} />
              </svg>

              <div className="flex items-center justify-between relative z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg}`}>
                  <Icon size={18} className={c.icon} />
                </div>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <p className={`text-2xl font-black ${c.text}`}>{card.value}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mb-1 ${c.trendColor}`}>
                  {card.trend}
                </span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{card.sub}</span>
                {card.href && <ArrowUpRight size={14} className="text-gray-400" />}
              </div>
            </>
          );

          const className = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 relative overflow-hidden group";

          return card.href ? (
            <Link key={card.label} href={card.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={card.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Charts & Grid) */}
        <div className="xl:col-span-2 space-y-6">
          <AdminAnalytics revenueData={analytics.revenueData} peakHoursData={analytics.peakHoursData} />
          <LiveCourtStatus courts={liveCourts} />
        </div>

        {/* Right Column (Widgets & Logs) */}
        <div className="space-y-6">
          <PendingVerificationWidget bookings={pendingReviewsData} />
        </div>
      </div>

      {/* Announcement Manager (Full Width) */}
      <AnnouncementManager initialData={announcements} />

      {/* Activity Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800">Audit Trail</h2>
            <p className="text-xs text-gray-400 mt-0.5">Log aktivitas sistem terbaru</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
            <TrendingUp size={13} />
            {recentLogs.length} aktivitas
          </div>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            Belum ada catatan aktivitas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide w-8">#</th>
                  <th className="text-left py-2 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Aktivitas</th>
                  <th className="text-left py-2 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Pengguna</th>
                  <th className="text-right py-2 px-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, index) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 font-medium">{log.description}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {log.user?.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{log.user?.name || "System"}</p>
                          <p className="text-xs text-gray-400">{log.user?.email || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
