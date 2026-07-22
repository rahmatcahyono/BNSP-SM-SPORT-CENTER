"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AnnouncementType } from "@prisma/client";

// Verify admin helper
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Peran Admin diperlukan.");
  }
  return session.user;
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  type: AnnouncementType;
}) {
  try {
    await verifyAdmin();
    
    if (!data.title || !data.content) {
      return { success: false, error: "Judul dan isi pengumuman wajib diisi." };
    }

    await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/customer");
    
    return { success: true, message: "Pengumuman berhasil dibuat." };
  } catch (error: any) {
    return { success: false, error: error.message || "Terjadi kesalahan server." };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.announcement.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/customer");
    return { success: true, message: "Pengumuman berhasil dihapus." };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus pengumuman." };
  }
}

export async function toggleAnnouncementStatusAction(id: string, isActive: boolean) {
  try {
    await verifyAdmin();
    await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/customer");
    return { success: true, message: `Pengumuman berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}.` };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah status pengumuman." };
  }
}

export async function getActiveAnnouncementsAction() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: announcements };
  } catch (error) {
    return { success: false, data: [] };
  }
}
