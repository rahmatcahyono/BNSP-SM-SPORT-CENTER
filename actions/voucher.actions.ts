"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DiscountType } from "@prisma/client";

// Verify user helper
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

export async function createVoucherAction(data: {
  code: string;
  discountType: DiscountType;
  discountNominal?: number;
  discountPercent?: number;
  maxUses: number;
}) {
  try {
    await verifyAdmin();

    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingVoucher) {
      return { success: false, error: "Kode voucher sudah digunakan." };
    }

    await prisma.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountNominal: data.discountNominal || null,
        discountPercent: data.discountPercent || null,
        maxUses: data.maxUses,
      },
    });

    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: "Voucher berhasil ditambahkan." };
  } catch (error: any) {
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function deleteVoucherAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.voucher.delete({ where: { id } });
    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: "Voucher berhasil dihapus." };
  } catch (error: any) {
    return { success: false, error: "Voucher gagal dihapus. Mungkin sedang digunakan." };
  }
}

export async function toggleVoucherStatusAction(id: string, isActive: boolean) {
  try {
    await verifyAdmin();
    await prisma.voucher.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/admin/courts");
    return { success: true, message: `Voucher berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}.` };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah status voucher." };
  }
}

export async function validateVoucherAction(code: string) {
  try {
    if (!code) {
      return { success: false, error: "Kode voucher kosong." };
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return { success: false, error: "Kode voucher tidak ditemukan." };
    }

    if (!voucher.isActive) {
      return { success: false, error: "Kode voucher sudah tidak aktif." };
    }

    if (voucher.usedCount >= voucher.maxUses) {
      return { success: false, error: "Kuota penggunaan voucher sudah habis." };
    }

    const user = await verifySession();

    // Check if the user has already used this voucher
    const existingUsage = await prisma.reservation.findFirst({
      where: {
        userId: user.id,
        voucherId: voucher.id,
        status: { not: "CANCELED" },
      },
    });

    if (existingUsage) {
      return { success: false, error: "Anda sudah pernah menggunakan kode voucher ini." };
    }

    return { 
      success: true, 
      data: {
        id: voucher.id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountNominal: voucher.discountNominal ? Number(voucher.discountNominal) : null,
        discountPercent: voucher.discountPercent,
      } 
    };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan validasi voucher." };
  }
}
