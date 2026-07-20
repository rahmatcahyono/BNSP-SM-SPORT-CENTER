import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal harus 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal harus 8 digit"),
  password: z.string().min(6, "Password minimal harus 6 karakter"),
});

export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const CourtSchema = z.object({
  name: z.string().min(2, "Nama lapangan minimal harus 2 karakter"),
  type: z.enum(["FUTSAL", "BADMINTON"]),
  pricePerHour: z.number().min(0, "Harga per jam tidak boleh negatif"),
  openTime: z.number().min(0).max(23),
  closeTime: z.number().min(0).max(23),
  status: z.enum(["AVAILABLE", "MAINTENANCE"]),
  imageUrl: z.string().optional(),
});

export const ReservationSchema = z.object({
  courtId: z.string().uuid("ID Lapangan tidak valid"),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  startTime: z.number().min(0).max(23),
  endTime: z.number().min(0).max(23),
});
