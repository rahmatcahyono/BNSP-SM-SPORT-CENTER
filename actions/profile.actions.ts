"use server";
// Force hot-reload after Prisma generation

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function getProfileAction() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) return { success: false, error: "User not found" };

  return { success: true, user };
}

export async function updateProfileAction(data: {
  name?: string;
  email?: string;
  phoneNumber?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // Check email uniqueness if changed
    if (data.email && data.email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) return { success: false, error: "Email sudah digunakan oleh akun lain." };
    }

    // Check phone uniqueness if changed
    if (data.phoneNumber) {
      const existing = await prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber, NOT: { id: session.user.id } },
      });
      if (existing) return { success: false, error: "Nomor HP sudah digunakan oleh akun lain." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name || undefined,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber || undefined,
      },
    });

    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (err: any) {
    return { success: false, error: "Gagal memperbarui profil." };
  }
}

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) return { success: false, error: "Password lama tidak sesuai." };

    if (data.newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter." };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diubah." };
  } catch (err: any) {
    return { success: false, error: "Gagal mengubah password." };
  }
}

import fs from "fs/promises";
import path from "path";

export async function uploadAvatarAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "File tidak ditemukan." };

    // Validasi ukuran max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran file maksimal 5MB." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const filename = `avatar_${session.user.id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: avatarUrl },
    });

    return { success: true, message: "Avatar berhasil diperbarui.", url: avatarUrl };
  } catch (err: any) {
    console.error("Upload Avatar Error:", err);
    return { success: false, error: "Gagal mengunggah avatar." };
  }
}
