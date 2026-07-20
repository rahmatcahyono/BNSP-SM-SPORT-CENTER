# Dokumen Laporan Pengujian (Testing)
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center

---

## A. Pengujian Unit (Unit Testing)

**Skenario Uji 1: Login Benar**
- **Langkah:** Masukkan email `admin@smsport.com` dan password `admin123`.
- **Hasil Diharapkan:** Sistem mengenali sesi admin dan mengarahkan pengguna ke halaman `/dashboard/admin`.
- **Hasil Aktual:** Sesuai harapan, redirect berhasil, token JWT terbuat.
- **Status:** **PASS** ✅

**Skenario Uji 2: Login Salah**
- **Langkah:** Masukkan email sembarang `user@salah.com` atau password yang salah.
- **Hasil Diharapkan:** Sistem menolak akses dan menampilkan pesan error peringatan.
- **Hasil Aktual:** UI menampilkan "Email atau password salah". Halaman tetap berada di `/login`.
- **Status:** **PASS** ✅

**Skenario Uji 3: Reservasi Valid**
- **Langkah:** Pilih lapangan futsal, tanggal yang masih kosong (belum dipesan orang lain), lalu klik "Proses Pembayaran".
- **Hasil Diharapkan:** Data tersimpan, pesanan muncul di halaman daftar booking pelanggan dengan status "Belum Bayar" (`PENDING_PAYMENT`).
- **Hasil Aktual:** Data reservasi baru muncul di tabel dengan Invoice unik.
- **Status:** **PASS** ✅

---

## B. Pengujian Integrasi (Integration Testing)

**Alur Pengujian (Workflow):** Login → Reservasi → Simpan → Laporan (Dashboard)

1. **Langkah 1 (Login Customer):** Pengguna login sebagai `budi@smsport.com`. (Berhasil masuk dashboard customer).
2. **Langkah 2 (Reservasi & Simpan):** Pengguna menekan tombol "Booking Baru", diarahkan ke *Booking Wizard*. Memilih "Futsal A", tanggal hari ini, jam 20:00 - 22:00. 
   - *Verifikasi:* Berhasil disimpan ke *database*, dialihkan kembali ke Dashboard.
3. **Langkah 3 (Simpan Pembayaran):** Di Dashboard, statusnya "Belum Bayar". Pelanggan klik "Bayar & Upload Bukti", kemudian mengunggah gambar resi.
   - *Verifikasi:* Status reservasi berubah menjadi "Butuh Review" (`AWAITING_REVIEW`).
4. **Langkah 4 (Laporan Admin):** Penguji melakukan logout, lalu login sebagai `admin@smsport.com`.
   - Admin masuk ke halaman "Review Pemesanan & Pembayaran".
   - Pesanan Budi (Futsal A) muncul dengan status "Butuh Review" dan menyertakan tombol **Lihat Bukti Gambar**.
   - Admin mengklik tombol "Setuju".
   - *Verifikasi Laporan:* Di halaman Dashboard Admin, grafik "Total Pendapatan (Disetujui)" otomatis bertambah sesuai biaya pesanan Budi tadi.

**Evaluasi Uji Coba Terintegrasi:** 
Alur kerja integrasi dari modul Autentikasi, Pemesanan, File Upload, hingga Laporan Agregasi Admin berjalan terhubung satu sama lain tanpa putus (State Sync berhasil).
- **Status:** **PASS** ✅
