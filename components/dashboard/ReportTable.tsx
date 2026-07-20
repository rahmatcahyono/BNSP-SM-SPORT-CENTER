"use client";

import React, { useState, useEffect } from "react";
import { getReportDataAction } from "@/actions/report.actions";
import { Download, Search, FileText, Filter, Calendar } from "lucide-react";

export default function ReportTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await getReportDataAction(startDate, endDate);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    // Data will re-fetch on next effect or we can just call it with empty params
    setTimeout(() => {
      getReportDataAction("", "").then((res) => {
        if (res.success && res.data) setData(res.data);
      });
    }, 0);
  };

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = [
      "No. Invoice",
      "Tanggal Pemesanan",
      "Waktu Mulai",
      "Durasi (Jam)",
      "Nama Lapangan",
      "Tipe Lapangan",
      "Nama Pelanggan",
      "Total Harga (Rp)",
      "Status",
    ];

    const rows = data.map((item) => {
      const date = new Date(item.date).toLocaleDateString("id-ID");
      const time = `${String(item.startTime).padStart(2, "0")}:00`;
      const courtName = item.court?.name || "N/A";
      const courtType = item.court?.type || "N/A";
      const customer = item.user?.name || "N/A";
      
      return [
        item.invoiceNumber,
        date,
        time,
        item.durationHours,
        courtName,
        courtType,
        customer,
        item.totalPrice,
        item.status,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Reservasi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Dari Tanggal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={14} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Sampai Tanggal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={14} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex-1 sm:flex-none justify-center"
            >
              <Filter size={16} />
              Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition flex-1 sm:flex-none justify-center"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={downloadCSV}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-green-200 flex-1 sm:flex-none justify-center"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
              <th className="py-3 px-4 font-semibold">Invoice</th>
              <th className="py-3 px-4 font-semibold">Tgl Main</th>
              <th className="py-3 px-4 font-semibold">Pelanggan</th>
              <th className="py-3 px-4 font-semibold">Lapangan</th>
              <th className="py-3 px-4 font-semibold text-center">Durasi</th>
              <th className="py-3 px-4 font-semibold text-right">Total (Rp)</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  Memuat data laporan...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.invoiceNumber}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{new Date(item.date).toLocaleDateString("id-ID")}</div>
                    <div className="text-xs text-gray-400">{String(item.startTime).padStart(2, "0")}:00</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{item.user?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{item.court?.name || "N/A"}</div>
                    <div className="text-xs text-gray-400">{item.court?.type || "N/A"}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-center">{item.durationHours} Jam</td>
                  <td className="py-3 px-4 text-gray-900 font-bold text-right">
                    {Number(item.totalPrice).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        item.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : item.status === "AWAITING_REVIEW"
                          ? "bg-orange-100 text-orange-700"
                          : item.status === "PENDING_PAYMENT"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
