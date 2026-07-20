# Dokumentasi Kode Program
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center

## 1. Arsitektur Perangkat Lunak
Aplikasi ini dikembangkan menggunakan **Next.js 16 (App Router)** dengan menerapkan pola arsitektur **Server Components** dan **Server Actions**. Untuk pengelolaan *database*, sistem menggunakan **Prisma ORM** yang berkomunikasi dengan PostgreSQL.

Struktur Layer:
- `app/`: Routing dan halaman (User Interface).
- `components/`: Komponen UI modular (mis. `BookingWizard`, `AdminBookingList`).
- `actions/`: Logika bisnis dan pemrosesan Server Actions (mis. pembuatan reservasi, proses login).
- `prisma/`: Berisi skema database (`schema.prisma`) dan koneksi adapter.

## 2. Penjelasan Modul dan Fungsi Utama

### A. Modul Autentikasi (`lib/auth.ts`)
Menggunakan **NextAuth.js** dengan *Credentials Provider*.
- Fungsi memverifikasi kredensial (*email* dan *password*) menggunakan modul `bcryptjs` untuk *hashing*.
- Saat autentikasi berhasil, token sesi JWT disimpan dan diteruskan ke *client* melalui Session.

### B. Modul Reservasi (`actions/reservation.actions.ts`)
**Fungsi `createReservationAction(data)`**
1. **Validasi Ketersediaan (Double Booking Check):**
   Fungsi ini membaca tabel `Reservation` berdasarkan `courtId` dan `date` untuk memeriksa apakah `startTime` hingga durasi selesai beririsan dengan pesanan orang lain.
2. **Kalkulasi Harga:**
   Menghitung `totalPrice` = `pricePerHour` dari *Court* × `durationHours`.
3. **Simpan ke Database:**
   Menggunakan `prisma.reservation.create` untuk mencatat transaksi dengan status awal `PENDING_PAYMENT` dan `invoiceNumber` di-generate unik.

**Fungsi `reviewReservationAction({reservationId, status})`**
- Dipanggil oleh Admin untuk menyetujui (`CONFIRMED`) atau menolak (`CANCELED`) sebuah transaksi reservasi berdasarkan validitas bukti transfer (`paymentProof`).

### C. Modul Lapangan (`actions/court.actions.ts`)
- Fungsi `upsertCourtAction`: Menyimpan lapangan baru atau memperbarui data lapangan yang sudah ada (futsal atau badminton).
- Fungsi `toggleCourtStatusAction`: Mengaktifkan atau menonaktifkan lapangan (*maintenance*).

### D. Modul Admin Dashboard (`nextjs-admin-dashboard`)
Menggunakan modul dashboard administrasi terintegrasi untuk pengelolaan data:
- **Autentikasi Dashboard:** Menggunakan **Better Auth** dengan dukungan kredensial lokal yang dipetakan pada tabel `user`, `session`, `account`, dan `verification` secara berdampingan dengan skema autentikasi utama.
- **Kelola Lapangan Olahraga:** Mendukung penambahan, pembaruan data, dan pengunggahan berkas gambar lapangan olahraga (Base64 data URI) serta pengecekan ketersediaan jam sewa berbasis kalender harian interaktif.
- **Review Pemesanan Sewa:** Modul untuk menyetujui (`CONFIRMED`) atau menolak (`CANCELED`) pembayaran sewa berdasarkan inspeksi visual berkas bukti transfer (`paymentProof`) pelanggan.

## 3. Penanganan Data Komponen
Untuk memastikan *passing data* yang aman antara Next.js Server Components ke Client Components, sistem menggunakan utility `serializeForClient()` (di `lib/serialize.ts`). Utility ini mengonversi properti berjenis `Date` menjadi *string* serta `Prisma.Decimal` menjadi tipe JavaScript `number`.

