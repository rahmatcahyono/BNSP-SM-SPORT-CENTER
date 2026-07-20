import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, ShieldCheck, Zap, CalendarDays, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f5fb] text-gray-800 flex flex-col justify-between overflow-hidden">

      {/* Header / Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">
              SM Sport Center
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 hover:text-violet-600 transition px-3 py-2 rounded-lg hover:bg-violet-50"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-md shadow-violet-200"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={12} />
            Sistem Reservasi Online Realtime
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-gray-800 mb-6">
            Pesan Lapangan Olahraga{" "}
            <span className="text-violet-600 block mt-1">
              Jadi Lebih Mudah &amp; Cepat
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-gray-500 text-base sm:text-lg mb-10">
            Sewa lapangan Futsal dan Badminton premium di SM Sport Center secara instan.
            Sistem kami mencegah bentrok jadwal secara real-time dengan proteksi concurrency terpercaya.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/customer/reservation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-lg shadow-violet-200"
            >
              Mulai Pesan Lapangan
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition shadow-sm"
            >
              Masuk ke Akun
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-y border-gray-200 py-10">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-black text-violet-600">100%</p>
              <p className="text-sm text-gray-500 mt-1">Anti Double Booking</p>
            </div>
            <div>
              <p className="text-3xl font-black text-violet-600">2</p>
              <p className="text-sm text-gray-500 mt-1">Jenis Lapangan</p>
            </div>
            <div>
              <p className="text-3xl font-black text-violet-600">24/7</p>
              <p className="text-sm text-gray-500 mt-1">Reservasi Online</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Kenapa Pilih SM Sport Center?</h2>
            <p className="text-gray-500 text-sm mt-2">Sistem reservasi modern yang aman, cepat, dan transparan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-500" size={22} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Pencegahan Bentrok</h3>
              <p className="text-sm text-gray-500">
                Pessimistic concurrency locking di tingkat database menjamin jadwal Anda 100% aman tanpa double-booking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                <ShieldCheck className="text-violet-500" size={22} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Verifikasi Instan</h3>
              <p className="text-sm text-gray-500">
                Unggah bukti transfer Anda dan pantau status pemesanan langsung di dashboard secara transparan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <Activity className="text-amber-500" size={22} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Fasilitas Premium</h3>
              <p className="text-sm text-gray-500">
                Tersedia lapangan bulu tangkis (badminton) karpet vinyl dan lapangan futsal berkualitas tinggi.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-violet-600 rounded-2xl p-8 md:p-12 text-center shadow-lg shadow-violet-200">
            <CalendarDays size={36} className="text-violet-200 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Siap Berolahraga Hari Ini?</h2>
            <p className="text-violet-200 text-sm mb-7 max-w-md mx-auto">
              Daftarkan akun Anda gratis dan langsung mulai reservasi lapangan favorit Anda sekarang.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-violet-600 bg-white hover:bg-violet-50 rounded-xl transition shadow-md"
              >
                <Users size={16} />
                Daftar Gratis
              </Link>
              <Link
                href="/dashboard/customer/reservation"
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-violet-700 hover:bg-violet-800 rounded-xl border border-violet-500 transition"
              >
                Langsung Pesan
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} SM Sport Center Reservation System. LSP Analisis Program.
        </div>
      </footer>
    </div>
  );
}
