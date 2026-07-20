import React from "react";
import { ReservationRepository } from "@/repositories/reservation.repository";
import { redirect } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const reservation = await ReservationRepository.findById(id);

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Invoice Tidak Ditemukan</h1>
          <Link href="/dashboard/admin/bookings" className="text-violet-600 hover:underline mt-4 inline-block">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine if it was paid via cash or bank transfer based on activity logs or if it's a walk-in.
  // For a complete app, we'd have a payment method field. Here we just show a generic "Lunas".
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* Print controls (hidden when printing) */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center print:hidden">
          <Link href="/dashboard/admin/bookings" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
          <button 
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            // Since this is a Server Component, we use an inline script trick for the print button or we can make a small client component.
            // Using a simple a tag with onClick is not possible in server components.
            // So we'll add a small script at the bottom.
            id="print-btn"
          >
            <Printer size={16} />
            Cetak Invoice
          </button>
        </div>

        {/* Invoice Paper */}
        <div className="p-8 sm:p-12 print:p-0 print:shadow-none bg-white">
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">INVOICE</h1>
              <p className="text-gray-500 font-medium mt-1">SM Sport Center</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Invoice No.</div>
              <div className="text-xl font-bold text-gray-900">{reservation.invoiceNumber}</div>
              <div className="text-sm text-gray-500 mt-2">
                Tanggal Diterbitkan: <span className="text-gray-900 font-medium">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Ditagihkan Kepada:</div>
              <div className="font-bold text-gray-900 text-lg">{reservation.user.name}</div>
              <div className="text-gray-600">{reservation.user.email}</div>
              <div className="text-gray-600">{reservation.user.phoneNumber || "-"}</div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Detail Reservasi:</div>
              <div className="font-bold text-gray-900">{reservation.court.name}</div>
              <div className="text-gray-600">{reservation.court.type}</div>
              <div className="text-gray-600 mt-1 font-medium text-violet-700">
                {new Date(reservation.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-gray-600">{String(reservation.startTime).padStart(2, "0")}:00 - {String(reservation.startTime + reservation.durationHours).padStart(2, "0")}:00 WIB</div>
            </div>
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50/50">
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Durasi</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tarif/Jam</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 px-4">
                  <div className="font-semibold text-gray-900">Sewa {reservation.court.name}</div>
                  <div className="text-sm text-gray-500">Booking {reservation.durationHours} Jam</div>
                </td>
                <td className="py-4 px-4 text-center font-medium text-gray-700">{reservation.durationHours} Jam</td>
                <td className="py-4 px-4 text-right text-gray-700">Rp {Number(reservation.court.pricePerHour).toLocaleString('id-ID')}</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">Rp {Number(reservation.totalPrice).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-900">Rp {Number(reservation.totalPrice).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Pajak</span>
                <span className="font-semibold text-gray-900">Rp 0</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-lg font-bold text-gray-900">Total Tagihan</span>
                <span className="text-2xl font-black text-violet-700">Rp {Number(reservation.totalPrice).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center sm:text-left">
            <h4 className="font-bold text-gray-900 mb-1">Status Pembayaran</h4>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              reservation.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
              reservation.status === "AWAITING_REVIEW" ? "bg-blue-100 text-blue-700" :
              reservation.status === "PENDING_PAYMENT" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {reservation.status === "CONFIRMED" ? "LUNAS / DISETUJUI" : 
               reservation.status === "AWAITING_REVIEW" ? "MENUNGGU REVIEW" :
               reservation.status === "PENDING_PAYMENT" ? "BELUM LUNAS" : "DIBATALKAN"}
            </div>
            <p className="text-sm text-gray-500 mt-4">Terima kasih telah mempercayakan SM Sport Center untuk kegiatan olahraga Anda.</p>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn').addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />
    </div>
  );
}
