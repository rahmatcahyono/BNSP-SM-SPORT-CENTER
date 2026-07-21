"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationService } from "@/services/reservation.service";
import { ReservationSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { LogService } from "@/services/log.service";

// Verify session helper
async function verifySession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Akses ditolak. Silakan login terlebih dahulu.");
  }
  return session.user;
}

// Verify admin helper
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Peran Admin diperlukan.");
  }
  return session.user;
}

export async function createReservationAction(
  data: z.infer<typeof ReservationSchema>
) {
  try {
    const user = await verifySession();
    const validatedData = ReservationSchema.parse(data);

    const reservation = await ReservationService.createReservation({
      userId: user.id,
      courtId: validatedData.courtId,
      dateStr: validatedData.dateStr,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
    });

    revalidatePath("/dashboard/customer");
    return {
      success: true,
      message: "Reservasi berhasil dibuat! Silakan unggah bukti pembayaran.",
      reservationId: reservation.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membuat reservasi.",
    };
  }
}

export async function uploadPaymentProofAction(formData: FormData) {
  try {
    const user = await verifySession();

    const reservationId = formData.get("reservationId") as string;
    const file = formData.get("file") as File;

    if (!reservationId || !file) {
      throw new Error("ID Reservasi dan Bukti Pembayaran wajib disertakan.");
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize and generate unique filename
    const ext = path.extname(file.name) || ".png";
    const filename = `${reservationId}_payment${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const paymentProofUrl = `/uploads/${filename}`;

    await ReservationService.uploadPaymentProof(
      reservationId,
      user.id,
      paymentProofUrl
    );

    revalidatePath("/dashboard/customer");
    revalidatePath("/dashboard/admin/bookings");
    return { success: true, message: "Bukti pembayaran berhasil diunggah!" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengunggah bukti pembayaran.",
    };
  }
}

export async function reviewReservationAction({
  reservationId,
  status,
}: {
  reservationId: string;
  status: "APPROVED" | "REJECTED";
}) {
  try {
    const admin = await getServerSession(authOptions);
    if (!admin || admin.user.role !== "ADMIN") {
      throw new Error("Akses ditolak. Peran Admin diperlukan.");
    }

    await ReservationService.reviewReservation({
      reservationId,
      adminId: admin.user.id,
      status,
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/customer");
    return {
      success: true,
      message: `Reservasi berhasil ${
        status === "APPROVED" ? "disetujui" : "ditolak"
      }!`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memproses reservasi.",
    };
  }
}

export async function getReservationsByDateAction(courtId: string, dateStr: string) {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const bookings = await prisma.reservation.findMany({
      where: {
        courtId,
        date,
        status: { in: ["PENDING_PAYMENT", "AWAITING_REVIEW", "CONFIRMED"] },
      },
      select: {
        startTime: true,
        durationHours: true,
      },
    });

    return { success: true, bookings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWalkInBookingAction(data: {
  courtId: string;
  date: string;
  startTime: number;
  durationHours: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
  paymentMethod: string;
}) {
  try {
    const admin = await verifyAdmin();
    
    const court = await prisma.court.findUnique({ where: { id: data.courtId } });
    if (!court) throw new Error("Lapangan tidak ditemukan.");

    const parsedDate = new Date(data.date);
    parsedDate.setHours(0, 0, 0, 0);

    const totalPrice = Number(court.pricePerHour) * data.durationHours;
    const invoiceNumber = `WLK-${Date.now().toString().slice(-6)}`;

    // Generate or use existing user for the walk-in customer so their name appears correctly on invoices/reports
    let finalUserId = data.userId;

    if (!finalUserId) {
      const guestEmail = data.customerEmail || `walkin-${Date.now()}@smsport.com`;
      
      // Check if user already exists by email
      let guestUser = await prisma.user.findUnique({
        where: { email: guestEmail }
      });

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: data.customerName,
            email: guestEmail,
            phoneNumber: data.customerPhone || null,
            password: "walkin-password", // Dummy password
            role: "CUSTOMER",
          },
        });
      }
      finalUserId = guestUser.id;
    }

    // We set status to AWAITING_REVIEW so the admin must confirm it manually
    const reservation = await prisma.reservation.create({
      data: {
        invoiceNumber,
        userId: finalUserId,
        courtId: data.courtId,
        date: parsedDate,
        startTime: data.startTime,
        durationHours: data.durationHours,
        totalPrice,
        status: "AWAITING_REVIEW", 
      },
    });

    const paymentLabel = data.paymentMethod === "CASH" ? "Tunai (Cash)" : "Transfer Bank";
    await LogService.logActivity(
      admin.id,
      "WALK_IN_BOOKING",
      `Admin membuat booking walk-in untuk ${data.customerName} (Metode: ${paymentLabel}) di lapangan ${court.name}`
    );

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/bookings");

    return { success: true, message: "Booking Walk-in tersimpan. Menunggu konfirmasi Admin." };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat booking walk-in." };
  }
}

export async function getCourtBookingCountsAction(dateStr: string) {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const bookings = await prisma.reservation.findMany({
      where: {
        date,
        status: { in: ["PENDING_PAYMENT", "AWAITING_REVIEW", "CONFIRMED"] },
      },
      select: {
        courtId: true,
        startTime: true,
        durationHours: true,
      },
    });

    // Group booked hours by courtId
    const countMap: Record<string, number> = {};
    bookings.forEach((b) => {
      if (!countMap[b.courtId]) countMap[b.courtId] = 0;
      countMap[b.courtId] += b.durationHours;
    });

    return { success: true, counts: countMap };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkPaymentStatusAction(reservationId: string) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });

    if (!reservation) {
      return { success: false, error: "Reservasi tidak ditemukan." };
    }

    return { success: true, status: reservation.status };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengecek status pembayaran." };
  }
}

export async function simulateWebhookAction(invoiceNumber: string, totalPrice: number) {
  try {
    const crypto = require("crypto");
    const serverKey = process.env.PAYMENT_GATEWAY_SERVER_KEY || "simulated-server-key-123";
    
    // Construct exactly what the webhook expects
    const payload = {
      order_id: invoiceNumber,
      transaction_status: "settlement",
      statusCode: "200",
      gross_amount: totalPrice.toString(),
      signature_key: crypto.createHash("sha512").update(`${invoiceNumber}200${totalPrice}${serverKey}`).digest("hex")
    };

    // Since we are in the same Next.js app, we can fetch our own API if we know the URL.
    // However, a more robust way in a Server Action is to directly call the webhook route handler's logic.
    // But since route handlers are separate, let's just do a direct DB update here to simulate what the webhook does
    // so we don't have to guess the absolute URL.
    
    const updatedReservation = await prisma.reservation.update({
      where: { invoiceNumber: invoiceNumber },
      data: {
        status: "CONFIRMED",
        expiresAt: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: updatedReservation.userId,
        action: "PAYMENT_SUCCESS",
        description: `Pembayaran otomatis via QRIS (Webhook Simulator) sukses untuk Invoice ${invoiceNumber}`,
      },
    });

    revalidatePath("/dashboard/customer");
    revalidatePath("/dashboard/admin/bookings");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
