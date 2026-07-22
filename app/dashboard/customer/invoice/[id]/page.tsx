import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Building2, Clock } from "lucide-react";
import PrintInvoiceButton from "@/components/dashboard/PrintInvoiceButton";
import QrisInvoiceQR from "@/components/dashboard/QrisInvoiceQR";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { court: true, voucher: true },
  });

  if (!reservation || reservation.userId !== session.user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Invoice tidak ditemukan</h2>
        <Link href="/dashboard/customer/bookings" className="mt-4 text-violet-600 hover:underline">
          Kembali ke My Bookings
        </Link>
      </div>
    );
  }

  // Determine status color/icon
  const isConfirmed = reservation.status === "CONFIRMED";
  const isPending = reservation.status === "PENDING_PAYMENT";
  const isQRIS = reservation.paymentMethod === "QRIS";
  const isTransferBank = reservation.paymentMethod === "TRANSFER_BANK" || !reservation.paymentMethod;
  const hasVoucher = reservation.voucherId && reservation.discountApplied && Number(reservation.discountApplied) > 0;
  
  return (
    <div className="flex items-center justify-center min-h-[80vh] py-10 px-4 print:p-0 print:min-h-0 print:block">
      {/* Receipt Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        <div className="p-8 text-center border-b border-dashed border-gray-200 print:pt-0">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm ${
            isConfirmed ? "bg-emerald-100 text-emerald-500" : 
            isPending ? "bg-amber-100 text-amber-500" : 
            "bg-blue-100 text-blue-500"
          }`}>
            {isPending ? <Clock size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            {isConfirmed ? "Pembayaran Berhasil" : isPending ? "Menunggu Pembayaran" : "Pesanan Diproses"}
          </h2>
          <p className="text-sm text-gray-500">
            Terima kasih telah memesan lapangan di SM Sport Center.
          </p>
        </div>

        <div className="p-8 space-y-6">
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-bold text-gray-800">{reservation.invoiceNumber}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Lapangan</span>
            <span className="font-bold text-gray-800">{reservation.court.name}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Jadwal</span>
            <div className="text-right">
              <span className="font-bold text-gray-800 block">
                {new Date(reservation.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-gray-500 text-xs">
                {reservation.startTime}:00 - {reservation.startTime + reservation.durationHours}:00
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Metode Pembayaran</span>
            {isQRIS ? (
              <div className="flex items-center gap-2">
                <img src="/qris-logo.png" alt="QRIS" className="h-5 object-contain" />
              </div>
            ) : (
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" /> Transfer Bank
              </span>
            )}
          </div>

          {/* QRIS Section - Only for QRIS payments */}
          {isQRIS && (
            <div className="flex justify-center pt-4 border-t border-dashed border-gray-200 mt-4">
              <QrisInvoiceQR
                invoiceNumber={reservation.invoiceNumber}
                totalPrice={Number(reservation.totalPrice)}
                courtName={reservation.court.name}
                schedule={`${new Date(reservation.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • ${reservation.startTime}:00 - ${reservation.startTime + reservation.durationHours}:00`}
              />
            </div>
          )}

          {/* Transfer Bank Section - Only for Transfer Bank payments */}
          {isTransferBank && !isQRIS && (
            <div className="border-t border-dashed border-gray-200 pt-4 mt-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">Detail Transfer</p>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BCA</div>
                <div>
                  <p className="text-sm font-bold text-gray-800 tracking-wider">7890 1234 5678</p>
                  <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BNI</div>
                <div>
                  <p className="text-sm font-bold text-gray-800 tracking-wider">0123 4567 8901</p>
                  <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            {/* Original Price (if voucher applied) */}
            {hasVoucher && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Harga Asli</span>
                  <span className="text-gray-400 line-through">
                    Rp {Number(reservation.originalPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    🎟️ Voucher
                    {reservation.voucher && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        {reservation.voucher.code}
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-emerald-600">
                    - Rp {Number(reservation.discountApplied).toLocaleString("id-ID")}
                  </span>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-black text-violet-600">
                Rp {Number(reservation.totalPrice).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 bg-gray-50 print:hidden">
          <Link
            href="/dashboard/customer/bookings"
            className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition shadow-md flex justify-center items-center"
          >
            Kembali ke My Bookings
          </Link>
          
          <PrintInvoiceButton />
        </div>
      </div>
    </div>
  );
}
