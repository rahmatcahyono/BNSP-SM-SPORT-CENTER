"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/serialize";

export async function getReportDataAction(startDate?: string, endDate?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Akses ditolak. Peran Admin diperlukan.");
    }

    // Build the date filter if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      // Set to end of day to include all bookings on that day
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const whereClause = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true },
        },
        court: {
          select: { name: true, type: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Convert all Decimal fields to standard Numbers using the serializer
    const plainReservations = serializeForClient(reservations);

    return { success: true, data: plainReservations };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data laporan." };
  }
}
