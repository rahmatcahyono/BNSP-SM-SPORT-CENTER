# Hasil Profiling Program
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center

## 1. Lingkungan Pengujian (Testing Environment)
- **Framework:** Next.js 16.2 (Turbopack)
- **Database:** Neon PostgreSQL Serverless
- **Perangkat:** Laptop / PC dengan browser Google Chrome (V8 Engine)
- **Tools:** Next.js DevTools & Prisma Query Logging

## 2. Metrik Performa (Pengukuran)

| Fitur / Halaman | Kecepatan Respon (Load Time) | Query Database Waktu | Keterangan |
| :--- | :--- | :--- | :--- |
| **Halaman Login** | ~150 ms | - | Sangat cepat (komponen klien ringan). |
| **Dashboard Admin** | ~400 ms | 120 ms | Agak lambat karena memuat *aggregation* data (`count` dan `sum`) untuk grafik. |
| **Cek Jadwal Lapangan** | ~250 ms | 50 ms | Cukup cepat. Query menggunakan `findMany` dengan filter *courtId* dan *date*. |
| **Proses Pembayaran (Upload)** | ~600 ms | 100 ms | Paling lambat karena melibatkan pembacaan form data (Base64/File) dan penulisan IO ke media penyimpanan. |

## 3. Identifikasi Bagian yang Lambat (Bottleneck)
Berdasarkan pengukuran, bagian paling lambat adalah:
1. **Query Kalkulasi Statistik Dashboard (`ReservationRepository.getStats`)**: Menggunakan metode *array reduce* pada level server Node.js untuk menghitung total revenue dari ribuan data yang ditarik, dibanding menghitungnya di *layer* database langsung.
2. **Unggah Bukti Pembayaran**: Ukuran gambar pelanggan tidak di-kompres sebelum diunggah ke server, mengakibatkan *bandwidth load* tinggi.

## 4. Rekomendasi Perbaikan
1. **Refaktor Query Dashboard (Database Level):**
   Ubah metode hitung manual di repository dengan memanfaatkan fitur *Prisma Aggregation* (`prisma.reservation.aggregate({ _sum: { totalPrice: true }})`). Ini akan mengalihkan beban kalkulasi dari CPU Node.js ke CPU PostgreSQL yang jauh lebih cepat memproses angka.
2. **Implementasi Image Compression:**
   Implementasikan library sisi klien (misal `browser-image-compression`) pada komponen *PaymentUploadModal.tsx* agar bukti gambar dikompres maksimal 500 KB sebelum dikirim via jaringan.
3. **Penerapan Caching Next.js:**
   Gunakan fungsi stabil Next.js `unstable_cache` untuk data Daftar Lapangan (`CourtRepository.findAllActive()`) karena data lapangan sangat jarang berubah.
