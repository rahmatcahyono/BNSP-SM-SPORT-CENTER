"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, ShieldCheck, Zap, CalendarDays, Users, MapPin, Phone } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
          <div className="flex flex-col items-center text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={12} />
              Sistem Reservasi Online Realtime
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-gray-800 mb-6 max-w-4xl">
              Pesan Lapangan Olahraga{" "}
              <span className="text-violet-600 block mt-2">
                Jadi Lebih Mudah &amp; Cepat
              </span>
            </h1>

            {/* Subtext */}
            <p className="max-w-2xl text-gray-500 text-base sm:text-lg mb-10">
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
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* 3D Card Futsal */}
            <CardContainer className="inter-var w-full">
              <CardBody className="bg-white relative group/card border-gray-100 w-full h-auto rounded-3xl p-6 border shadow-xl shadow-violet-100/50">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-gray-800"
                >
                  Lapangan Futsal Premium
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-gray-500 text-sm max-w-sm mt-2"
                >
                  Rumput sintetis standar internasional. Ruang sirkulasi udara optimal dan pencahayaan terang.
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-6">
                  <img
                    src="/court.jpg"
                    height="1000"
                    width="1000"
                    className="h-56 sm:h-72 w-full object-cover rounded-2xl group-hover/card:shadow-xl transition-shadow"
                    alt="Lapangan Futsal"
                  />
                </CardItem>
                <div className="flex justify-end items-center mt-8">
                  <CardItem translateZ={20}>
                    <Link
                      href="#fasilitas-futsal"
                      className="px-5 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-bold transition block"
                    >
                      Tentang Lapangan
                    </Link>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>

            {/* 3D Card Badminton */}
            <CardContainer className="inter-var w-full">
              <CardBody className="bg-white relative group/card border-gray-100 w-full h-auto rounded-3xl p-6 border shadow-xl shadow-violet-100/50">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-gray-800"
                >
                  Lapangan Badminton VIP
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-gray-500 text-sm max-w-sm mt-2"
                >
                  Karpet vinyl tebal dan anti-slip. Bebas silau dan nyaman untuk permainan tempo tinggi.
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-6">
                  <img
                    src="/court%202.jpg"
                    height="1000"
                    width="1000"
                    className="h-56 sm:h-72 w-full object-cover rounded-2xl group-hover/card:shadow-xl transition-shadow"
                    alt="Lapangan Badminton"
                  />
                </CardItem>
                <div className="flex justify-end items-center mt-8">
                  <CardItem translateZ={20}>
                    <Link
                      href="#fasilitas-badminton"
                      className="px-5 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-bold transition block"
                    >
                      Tentang Lapangan
                    </Link>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>
        </section>

        {/* Fasilitas Futsal Scroll Animation */}
        <section className="bg-white">
          <ContainerScroll
            cardId="fasilitas-futsal"
            titleComponent={
              <></>
            }
          >
            <div className="flex flex-col md:flex-row h-full w-full bg-white rounded-2xl overflow-hidden">
              <div className="w-full md:w-1/2 h-64 md:h-full p-2 md:p-4">
                <img
                  src="/court.jpg"
                  alt="Fasilitas Futsal"
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                  draggable={false}
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-gray-50 text-left">
                <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">Fasilitas Kelas Dunia</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  Nikmati sensasi bermain di lapangan futsal berstandar internasional. Menggunakan rumput sintetis premium yang empuk dan anti-lecet, memastikan keamanan dan performa maksimal untuk setiap manuver Anda. Sirkulasi udara yang sejuk dan pencahayaan terang benderang membuat Anda dan tim bisa bermain penuh energi kapan saja!
                </p>
                <ul className="space-y-3 mb-8 text-sm md:text-base text-gray-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18} /> Rumput Sintetis Bintang 5</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18} /> Tribun Penonton Luas & Nyaman</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18} /> Ruang Ganti & Toilet Bersih Bersinar</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18} /> Peminjaman Bola & Rompi Gratis</li>
                </ul>
                <Link
                  href="/dashboard/customer/reservation"
                  className="inline-block text-center px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:bg-violet-700 transition"
                >
                  Booking Jadwal Sekarang
                </Link>
              </div>
            </div>
          </ContainerScroll>
        </section>

        {/* Fasilitas Badminton Scroll Animation */}
        <section className="bg-[#f4f5fb]">
          <ContainerScroll
            cardId="fasilitas-badminton"
            titleComponent={
              <></>
            }
          >
            <div className="flex flex-col md:flex-row h-full w-full bg-white rounded-2xl overflow-hidden">
              <div className="w-full md:w-1/2 h-64 md:h-full p-2 md:p-4">
                <img
                  src="/court%202.jpg"
                  alt="Fasilitas Badminton"
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                  draggable={false}
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-gray-50 text-left">
                <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">Pengalaman Juara</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  Tingkatkan level permainan Anda di lapangan badminton VIP kami. Didesain secara khusus dengan karpet vinyl tebal bersertifikasi BWF yang memberikan cengkeraman maksimal dan melindungi sendi Anda dari cedera. Dilengkapi sistem pencahayaan canggih anti-silau, rasakan pengalaman bermain layaknya atlet profesional di turnamen dunia.
                </p>
                <ul className="space-y-3 mb-8 text-sm md:text-base text-gray-700 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Karpet Vinyl BWF Standard Anti-slip</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Pencahayaan LED Canggih Anti-Silau</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Jarak Antar Lapangan Luas & Aman</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Area Istirahat Eksklusif Pemain</li>
                </ul>
                <Link
                  href="/dashboard/customer/reservation"
                  className="inline-block text-center px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:bg-violet-700 transition"
                >
                  Booking Lapangan VIP
                </Link>
              </div>
            </div>
          </ContainerScroll>
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


      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                <span className="text-red-600 italic">SM</span>Sport Center
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pusat kebugaran dan penyewaan lapangan kelas turnamen. Reservasi mudah dan cepat, aman, dan tanpa antre panjang.
              </p>
            </div>
            {/* Column 2 */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Navigasi Utama</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/" className="hover:text-violet-600 transition">Beranda</Link></li>
                <li><Link href="#fasilitas-futsal" className="hover:text-violet-600 transition">Fasilitas</Link></li>
                <li><Link href="/dashboard/customer/reservation" className="hover:text-violet-600 transition">Pesan Jadwal</Link></li>
              </ul>
            </div>
            {/* Column 3 */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Kontak Kami</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Jl. Olahraga No. 325, Komplek Stadion, Jakarta 10110</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-red-600 shrink-0" strokeWidth={1.5} />
                  <span>+62 812 3456 7890</span>
                </li>
              </ul>
            </div>
            {/* Column 4 */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Operasional</h4>
              <div className="flex justify-between items-center text-sm text-gray-500 border-b border-gray-100 pb-3">
                <span>Senin - Minggu</span>
                <span className="font-bold text-gray-800">08:00 - 23:00</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs text-center md:text-left">
              © {new Date().getFullYear()} SM Sport Center. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
