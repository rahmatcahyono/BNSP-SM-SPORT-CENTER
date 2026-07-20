import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReportTable from "@/components/dashboard/ReportTable";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50/50 pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Transaksi & Reservasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau, filter, dan unduh laporan pemesanan dalam format CSV.
        </p>
      </div>

      {/* Main Content */}
      <ReportTable />
    </div>
  );
}
