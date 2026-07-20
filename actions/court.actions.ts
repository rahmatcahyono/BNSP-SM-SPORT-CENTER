"use server";
// Force hot-reload after Prisma generation


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CourtRepository } from "@/repositories/court.repository";
import { CourtSchema } from "@/lib/validations";
import { CourtStatus, CourtType } from "@prisma/client";
import { LogService } from "@/services/log.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Peran Admin diperlukan.");
  }
  return session.user;
}

export async function createCourtAction(data: z.infer<typeof CourtSchema>) {
  try {
    const admin = await verifyAdmin();
    const validatedData = CourtSchema.parse(data);

    const court = await CourtRepository.create({
      ...validatedData,
      status: validatedData.status as CourtStatus,
      type: validatedData.type as CourtType,
    });

    await LogService.logActivity(
      admin.id,
      "CREATE_COURT",
      `Admin membuat lapangan baru: ${court.name}`
    );

    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: "Lapangan berhasil dibuat!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat lapangan." };
  }
}

export async function updateCourtAction(
  id: string,
  data: z.infer<typeof CourtSchema>
) {
  try {
    const admin = await verifyAdmin();
    const validatedData = CourtSchema.parse(data);
    console.log("VALIDATED DATA FOR UPDATE:", validatedData);

    const court = await CourtRepository.update(id, {
      ...validatedData,
      status: validatedData.status as CourtStatus,
      type: validatedData.type as CourtType,
    });

    await LogService.logActivity(
      admin.id,
      "UPDATE_COURT",
      `Admin memperbarui lapangan: ${court.name}`
    );

    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: "Lapangan berhasil diperbarui!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui lapangan." };
  }
}

export async function deleteCourtAction(id: string) {
  try {
    const admin = await verifyAdmin();
    const court = await CourtRepository.delete(id);

    await LogService.logActivity(
      admin.id,
      "DELETE_COURT",
      `Admin menghapus lapangan: ${court.name}`
    );

    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: "Lapangan berhasil dihapus!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus lapangan." };
  }
}

export async function getCourtsAction() {
  try {
    const courts = await CourtRepository.findAll();
    // Convert Decimal pricePerHour to standard Number to avoid Next.js Serialization error
    const plainCourts = courts.map((c: any) => ({
      ...c,
      pricePerHour: Number(c.pricePerHour),
    }));
    return { success: true, courts: plainCourts };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data lapangan." };
  }
}
