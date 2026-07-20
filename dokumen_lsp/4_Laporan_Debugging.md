# Laporan Debugging
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center
**Skenario Masalah:** Reservasi tetap tersimpan meskipun jadwal sudah terisi (*Double Booking*).

---

## 1. Identifikasi Masalah
**Deskripsi:** Saat pelanggan A memesan Lapangan Futsal pada pukul 18:00 - 20:00, dan pelanggan B mencoba memesan Lapangan Futsal yang sama pada pukul 19:00 - 20:00, sistem tetap memproses pesanan B, menyebabkan jadwal berbenturan.
**Penyebab Masalah (Root Cause):** Algoritma pembuatan reservasi langsung melakukan `INSERT` ke database tanpa melakukan validasi kondisi tumpang tindih waktu (*overlapping slots*) pada tanggal yang sama.

## 2. Perbaikan Kode (Debugging & Refactoring)
Untuk memperbaiki masalah ini, ditambahkan validasi logis di fungsi `createReservationAction` (pada `actions/reservation.actions.ts`). 

### Potongan Kode yang Diperbaiki:
```typescript
// 1. Ambil semua reservasi aktif pada lapangan dan tanggal yang sama
const existingBookings = await prisma.reservation.findMany({
  where: {
    courtId: data.courtId,
    date: new Date(data.date),
    status: {
      in: ["PENDING_PAYMENT", "AWAITING_REVIEW", "CONFIRMED"]
    }
  },
});

// 2. Lakukan iterasi pengecekan jadwal bentrok
const reqStart = data.startTime;
const reqEnd = data.startTime + data.durationHours;

const isConflict = existingBookings.some((booking) => {
  const existingStart = booking.startTime;
  const existingEnd = booking.startTime + booking.durationHours;

  // Rumus deteksi overlap: StartA < EndB AND EndA > StartB
  return reqStart < existingEnd && reqEnd > existingStart;
});

// 3. Batalkan proses jika terjadi bentrok
if (isConflict) {
  return {
    success: false,
    error: "Jadwal pada jam tersebut sudah terisi. Silakan pilih jam lain.",
  };
}
```

## 3. Hasil Perbaikan (Testing Ulang)
Setelah logika tersebut diimplementasikan:
1. Pelanggan A memesan jam 18:00 - 20:00 (Berhasil).
2. Pelanggan B mencoba memesan jam 19:00 - 21:00.
3. Sistem mendeteksi `isConflict = true` dan mengembalikan pesan error *"Jadwal pada jam tersebut sudah terisi"*. Data Pelanggan B tidak masuk ke dalam tabel database.

**Status:** *Resolved* (Selesai).
