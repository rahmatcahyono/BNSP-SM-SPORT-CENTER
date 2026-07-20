"use server";

import { AuthService } from "@/services/auth.service";
import { RegisterSchema } from "@/lib/validations";
import { z } from "zod";

export async function signUpAction(data: z.infer<typeof RegisterSchema>) {
  try {
    const validatedData = RegisterSchema.parse(data);

    await AuthService.register({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      phoneNumber: validatedData.phone,
    });

    return { success: true, message: "Pendaftaran berhasil! Silakan login." };
  } catch (error: any) {
    return { success: false, error: error.message || "Terjadi kesalahan saat pendaftaran." };
  }
}

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPasswordAction(email: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Akun dengan email tersebut tidak ditemukan." };
    }

    // Check if new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return {
        success: false,
        error: "Password baru tidak boleh sama dengan password sebelumnya.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diubah. Silakan login dengan password baru Anda." };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat mengubah password." };
  }
}
