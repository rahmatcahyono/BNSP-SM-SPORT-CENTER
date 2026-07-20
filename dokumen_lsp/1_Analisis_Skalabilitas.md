# Dokumen Analisis Skalabilitas Perangkat Lunak
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center
**Posisi:** Analis Program

## 1. Analisis Kebutuhan Sistem

### Aktor (Pengguna Sistem)
1. **Pelanggan (Customer):** Pengguna yang ingin menyewa lapangan olahraga.
2. **Administrator:** Staf/manajemen SM Sport Center yang mengelola persetujuan jadwal dan operasional lapangan.

### Kebutuhan Fungsional
- **Sistem Autentikasi:** Aktor dapat mendaftar (register) dan masuk (login) ke dalam sistem.
- **Manajemen Lapangan (Admin):** Admin dapat menambah, mengubah, menonaktifkan, dan melihat ketersediaan lapangan futsal dan badminton.
- **Pemesanan Lapangan (Pelanggan):** Pelanggan dapat memilih lapangan, tanggal, jam main, serta melihat jadwal yang sudah terisi agar tidak terjadi *double booking*.
- **Pembayaran (Pelanggan):** Pelanggan dapat mengunggah bukti transfer untuk pembayaran reservasi mereka.
- **Verifikasi (Admin):** Admin dapat menyetujui (Approve) atau menolak (Reject) reservasi masuk.
- **Laporan (Admin):** Admin dapat melihat statistik pendapatan dan total transaksi masuk pada Dashboard.

### Kebutuhan Non-Fungsional
- **Keamanan:** Password pengguna harus dienkripsi.
- **Performa:** Waktu respons pencarian jadwal kosong harus di bawah 1 detik.
- **Reliabilitas:** Sistem tidak membiarkan dua pelanggan memesan jadwal yang sama pada lapangan yang sama (penanganan *Concurrency*).

---

## 2. Analisis Skalabilitas & Potensi Bottleneck

### Identifikasi Potensi Bottleneck
1. **Database Connection Pool:** Jika sistem dikunjungi banyak orang saat jam ramai (misalnya pukul 18:00 - 20:00 untuk booking malam), *connection pool* PostgreSQL ke Neon Serverless dapat habis, menyebabkan error pada *query*.
2. **Date & Time Query Parsing:** Pengecekan *double booking* yang melakukan loop terhadap seluruh data reservasi berpotensi membebani CPU server jika data reservasi historis sudah sangat besar.

### Estimasi Pertumbuhan Data
- Asumsi transaksi per hari: 20 reservasi (dari 5 lapangan).
- Estimasi dalam 1 bulan: ~600 baris data reservasi.
- Estimasi dalam 1 tahun: ~7.200 baris data reservasi.
(Ukuran tabel reservasi dalam 5 tahun tetap sangat kecil (<10 MB), sehingga *bottleneck* penyimpanan data sangat rendah).

### Rekomendasi Peningkatan Performa
1. **Penggunaan Indeks pada Database:** Menambahkan indeks (`@@index`) pada kolom `date` dan `courtId` di tabel `Reservation` agar *query* pencarian jadwal kosong dapat lebih cepat seiring bertambahnya data.
2. **Connection Pooling Database:** Menggunakan arsitektur Serverless Database seperti Neon dengan fitur PgBouncer agar manajemen *connection pool* tetap optimal meski mendapat lonjakan trafik pelanggan.
3. **Pemisahan Data Historis:** Menghapus data reservasi (*soft delete* atau diarsipkan ke tabel lain) yang usianya sudah lebih dari 2 tahun untuk menjaga tabel utama tetap ramping.
