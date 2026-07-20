"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      users: users.map((u) => ({
        ...u,
        phoneNumber: u.phoneNumber ? String(u.phoneNumber) : "",
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        password: "", // hide password
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data user." };
  }
}

export async function createUserAction(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  role: "ADMIN" | "CUSTOMER";
  password?: string;
}) {
  try {
    if (!data.name || !data.email) {
      throw new Error("Nama dan Email wajib diisi.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("Email sudah terdaftar.");
    }

    const passwordStr = data.password || "password123";
    if (passwordStr.length < 8) {
      throw new Error("Kata sandi minimal harus 8 karakter.");
    }

    const hashedPassword = await bcrypt.hash(passwordStr, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        role: data.role,
        password: hashedPassword,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User baru berhasil dibuat!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat user baru." };
  }
}

export async function updateUserAction(
  id: string,
  data: {
    name: string;
    email: string;
    phoneNumber?: string;
    role: "ADMIN" | "CUSTOMER";
    password?: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });
    if (emailConflict) {
      throw new Error("Email sudah digunakan oleh user lain.");
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber || null,
      role: data.role,
    };

    if (data.password && data.password.trim() !== "") {
      if (data.password.length < 8) {
        throw new Error("Kata sandi minimal harus 8 karakter.");
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User berhasil diperbarui!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui user." };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    // Because of foreign key constraints (onDelete: Restrict for reservations),
    // we must delete their reservations first before deleting the user.
    await prisma.$transaction([
      prisma.reservation.deleteMany({
        where: { userId: id },
      }),
      prisma.user.delete({
        where: { id },
      }),
    ]);

    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User berhasil dihapus!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus user." };
  }
}
