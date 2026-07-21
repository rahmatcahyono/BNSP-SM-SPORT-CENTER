import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, statusCode, gross_amount, signature_key } = body;

    // 1. VERIFIKASI SIGNATURE (PENTING UNTUK KEAMANAN)
    // Dalam production, serverKey diambil dari environment variable Midtrans.
    // Untuk simulasi ini kita hardcode atau gunakan string sementara.
    const serverKey = process.env.PAYMENT_GATEWAY_SERVER_KEY || "simulated-server-key-123";
    
    const hashed = crypto
      .createHash("sha512")
      .update(`${order_id}${statusCode}${gross_amount}${serverKey}`)
      .digest("hex");

    // Jika signature tidak valid (bukan dari payment gateway asli), tolak request
    if (hashed !== signature_key) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // 2. CEK STATUS PEMBAYARAN
    if (transaction_status === "settlement" || transaction_status === "capture") {
      
      // Update Database Otomatis
      const updatedReservation = await prisma.reservation.update({
        where: { invoiceNumber: order_id },
        data: {
          status: "CONFIRMED",
          expiresAt: null, // Hapus lock timer karena sudah dibayar lunas
        },
      });

      // Tambah Log Aktivitas
      await prisma.activityLog.create({
        data: {
          userId: updatedReservation.userId,
          action: "PAYMENT_SUCCESS",
          description: `Pembayaran otomatis via QRIS (Webhook) sukses untuk Invoice ${order_id}`,
        },
      });

      // Beritahu frontend cache untuk update
      revalidatePath("/dashboard/customer");
      revalidatePath("/dashboard/admin/bookings");
      
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      
      // Jika kedaluwarsa / dibatalkan oleh sistem
      await prisma.reservation.update({
        where: { invoiceNumber: order_id },
        data: { status: "CANCELED" },
      });
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}
