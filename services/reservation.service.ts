import { prisma } from "@/lib/prisma";
import { CourtRepository } from "@/repositories/court.repository";
import { LogService } from "./log.service";
import { Prisma } from "@prisma/client";

export class ReservationService {
  static generateInvoiceNo() {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `INV-${dateStr}-${randomSuffix}`;
  }

  static async createReservation({
    userId,
    courtId,
    dateStr,
    startTime,
    endTime,
  }: {
    userId: string;
    courtId: string;
    dateStr: string;
    startTime: number;
    endTime: number;
  }) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    // Validate inputs
    if (startTime >= endTime) {
      throw new Error("Jam mulai harus lebih awal dari jam selesai.");
    }

    const court = await CourtRepository.findById(courtId);
    if (!court) {
      throw new Error("Lapangan tidak ditemukan.");
    }

    if (court.status !== "AVAILABLE") {
      throw new Error("Lapangan sedang tidak aktif atau dalam perawatan.");
    }

    // Check operational hours
    if (startTime < court.openTime || endTime > court.closeTime) {
      throw new Error(
        `Waktu reservasi di luar jam operasional (${court.openTime}:00 - ${court.closeTime}:00).`
      );
    }

    // Double-booking check inside a transaction block with FOR UPDATE pessimistic lock
    return await prisma.$transaction(async (tx) => {
      // Execute raw pessimistic lock on the court's reservations for that date
      await tx.$executeRaw`
        SELECT * FROM "reservations"
        WHERE "courtId" = ${courtId}
          AND "date" = ${date}
        FOR UPDATE
      `;

      // Check if slot has already been booked (pending or approved status)
      // Conflict conditions: new_startTime < existing_endTime AND new_endTime > existing_startTime
      const overlappingReservations = await tx.reservation.findMany({
        where: {
          courtId,
          date,
          status: { in: ["PENDING_PAYMENT", "AWAITING_REVIEW", "CONFIRMED"] },
        },
      });

      const isConflict = overlappingReservations.some((res) => {
        const resEndTime = res.startTime + res.durationHours;
        return startTime < resEndTime && endTime > res.startTime;
      });

      if (isConflict) {
        throw new Error(
          "Jadwal lapangan bentrok. Silakan pilih jam atau lapangan lain."
        );
      }

      // Calculate price
      const durationHours = endTime - startTime;
      const priceVal = Number(court.pricePerHour);
      const totalPrice = new Prisma.Decimal(priceVal * durationHours);
      const invoiceNumber = this.generateInvoiceNo();

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          invoiceNumber,
          userId,
          courtId,
          date,
          startTime,
          durationHours,
          totalPrice,
          status: "PENDING_PAYMENT",
        },
      });

      // Write activity log
      await LogService.logActivity(
        userId,
        "CREATE_RESERVATION",
        `Membuat reservasi ${invoiceNumber} untuk lapangan ${court.name}`
      );

      return reservation;
    });
  }

  static async uploadPaymentProof(
    reservationId: string,
    userId: string,
    paymentProof: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { court: true },
    });

    if (!reservation) {
      throw new Error("Reservasi tidak ditemukan.");
    }

    if (reservation.userId !== userId) {
      throw new Error("Akses ditolak. Ini bukan reservasi Anda.");
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentProof,
        status: "AWAITING_REVIEW", // Changes to review pending status
      },
    });

    await LogService.logActivity(
      userId,
      "UPLOAD_PAYMENT",
      `Mengunggah bukti pembayaran untuk ${reservation.invoiceNumber}`
    );

    return updated;
  }

  static async reviewReservation({
    reservationId,
    adminId,
    status,
  }: {
    reservationId: string;
    adminId: string;
    status: "APPROVED" | "REJECTED";
  }) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error("Reservasi tidak ditemukan.");
    }

    const dbStatus = status === "APPROVED" ? "CONFIRMED" : "CANCELED";

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: dbStatus },
    });

    await LogService.logActivity(
      adminId,
      status === "APPROVED" ? "APPROVE_RESERVATION" : "REJECT_RESERVATION",
      `Admin meninjau reservasi ${reservation.invoiceNumber} dengan hasil: ${status}`
    );

    return updated;
  }
}
