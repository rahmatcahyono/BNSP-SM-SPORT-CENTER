"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getReservationsByDateAction, createReservationAction, getCourtBookingCountsAction } from "@/actions/reservation.actions";
import { useToast } from "@/components/Providers";
import { Calendar, Clock, Trophy, MapPin, CheckCircle2, AlertCircle, Shield, Check, Info } from "lucide-react";
import CustomCalendar from "./CustomCalendar";

interface Court {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  openTime: number;
  closeTime: number;
  status: string;
  imageUrl?: string | null;
}

export default function BookingWizard({ courts }: { courts: Court[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [category, setCategory] = useState<"ALL" | "FUTSAL" | "BADMINTON">("ALL");
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState<number | "">("");
  const [duration, setDuration] = useState<number>(1);
  const endTime = typeof startTime === "number" ? startTime + duration : "";

  const [reservedSlots, setReservedSlots] = useState<{ start: number; end: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [courtBookingCounts, setCourtBookingCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  const filteredCourts = courts.filter(c => category === "ALL" || c.type === category);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = new Date(today.getTime() - tzOffset).toISOString().split("T")[0];
    setDateStr(localISOTime);
  }, []);

  // Fetch court booking counts
  useEffect(() => {
    if (!dateStr) return;
    async function fetchCounts() {
      setLoadingCounts(true);
      try {
        const res = await getCourtBookingCountsAction(dateStr);
        if (res.success && res.counts) {
          setCourtBookingCounts(res.counts);
        }
      } catch (err) {} finally {
        setLoadingCounts(false);
      }
    }
    fetchCounts();
  }, [dateStr]);

  // Fetch reserved slots
  useEffect(() => {
    if (!selectedCourtId || !dateStr) return;
    async function fetchSlots() {
      setLoadingSlots(true);
      setStartTime("");
      setDuration(1);
      try {
        const res = await getReservationsByDateAction(selectedCourtId, dateStr);
        if (res.success && res.bookings) {
          const slots = res.bookings.map((b: any) => ({
            start: b.startTime,
            end: b.startTime + b.durationHours,
          }));
          setReservedSlots(slots);
        } else {
          toast("Gagal memuat jadwal yang sudah terisi.", "error");
        }
      } catch (err) {
        toast("Terjadi kesalahan koneksi.", "error");
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedCourtId, dateStr]);

  const isHourBooked = (hour: number) => {
    return reservedSlots.some((slot) => hour >= slot.start && hour < slot.end);
  };

  const hasOverlap = (start: number, end: number) => {
    return reservedSlots.some((slot) => start < slot.end && end > slot.start);
  };

  const handleSlotClick = (hour: number) => {
    if (startTime === hour) {
      setStartTime("");
    } else {
      setStartTime(hour);
      setDuration(1);
    }
  };

  const getMaxAvailableDuration = () => {
    if (startTime === "" || !selectedCourt) return 0;
    
    // Max package is 5 hours
    let max = 5;
    
    // Check against closing time
    const hoursToClose = selectedCourt.closeTime - startTime;
    if (hoursToClose < max) max = hoursToClose;

    // Check against next booked slot
    for (let i = 1; i <= max; i++) {
      if (isHourBooked(startTime + i)) {
        return i; // Only available up to the slot right before the booked one
      }
    }
    
    return max;
  };

  const maxDuration = getMaxAvailableDuration();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtId || !dateStr || typeof startTime !== "number" || typeof endTime !== "number") {
      toast("Harap lengkapi semua data reservasi.", "error");
      return;
    }

    if (hasOverlap(startTime, endTime)) {
      toast("Jadwal yang Anda pilih bentrok dengan pesanan lain.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createReservationAction({
        courtId: selectedCourtId,
        dateStr,
        startTime,
        endTime,
      });

      if (res.success) {
        toast(res.message, "success");
        router.push("/dashboard/customer");
      } else {
        toast(res.error || "Gagal membuat reservasi.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getOperationalHours = () => {
    if (!selectedCourt) return [];
    const hours = [];
    for (let i = selectedCourt.openTime; i < selectedCourt.closeTime; i++) {
      hours.push(i);
    }
    return hours;
  };

  const actualDuration = startTime !== "" ? duration : 0;
  const totalPrice = selectedCourt ? selectedCourt.pricePerHour * actualDuration : 0;
  const tax = totalPrice * 0.11; // 11% PPN example
  const grandTotal = totalPrice + tax;
  const getTotalSlots = (court: Court) => court.closeTime - court.openTime;

  return (
    <div className="w-full space-y-8">
      
      {/* STEP 1 - PILIH LAPANGAN */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">1. Pilih Lapangan</h2>
        <div className="flex gap-2 border-b border-gray-200 pb-2 mb-5">
          {["ALL", "FUTSAL", "BADMINTON"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${
                category === cat
                  ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {cat === "ALL" ? "Semua" : cat === "FUTSAL" ? "Futsal" : "Badminton"}
            </button>
          ))}
        </div>

        {/* Katalog Lapangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourts.map((court) => {
            const bookedHours = courtBookingCounts[court.id] || 0;
            const totalSlots = getTotalSlots(court);
            const availableHours = totalSlots - bookedHours;
            const isFullyBooked = availableHours <= 0;
            const isSelected = selectedCourtId === court.id;

            return (
              <button
                key={court.id}
                type="button"
                onClick={() => setSelectedCourtId(court.id)}
                className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-200 group ${
                  isSelected
                    ? "border-violet-500 ring-2 ring-violet-200 shadow-lg shadow-violet-100"
                    : "border-gray-200 hover:border-violet-300 hover:shadow-md shadow-sm"
                } ${isFullyBooked ? "opacity-75" : ""}`}
              >
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {court.imageUrl ? (
                    <img src={court.imageUrl} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <MapPin size={32} className="text-gray-400" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    {isFullyBooked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-red-500 text-white px-2 py-1 rounded-lg shadow">
                        <AlertCircle size={10} /> Penuh
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-500 text-white px-2 py-1 rounded-lg shadow">
                        <CheckCircle2 size={10} /> Tersedia
                      </span>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow">
                      <Check size={14} className="text-white" />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex gap-1 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md shadow ${court.type === "FUTSAL" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}`}>
                      {court.type}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-md shadow bg-gray-900/70 backdrop-blur-sm text-white">Indoor</span>
                    <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-md shadow bg-gray-900/70 backdrop-blur-sm text-white">{court.type === "FUTSAL" ? "Rumput Sintetis" : "Vinyl Premium"}</span>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <h4 className="font-bold text-gray-800 text-base mb-1">{court.name}</h4>
                  <p className="text-xs font-semibold text-gray-500 mb-3">{court.openTime}:00 - {court.closeTime}:00</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col w-1/2">
                      <span className="text-[10px] text-gray-400 mb-0.5">Sisa Jam Hari Ini</span>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isFullyBooked ? "bg-red-500" : availableHours <= 2 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(0, (availableHours / totalSlots) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-black text-violet-600">
                      Rp {court.pricePerHour.toLocaleString()}/Jam
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2 - PILIH TANGGAL & JAM */}
      {selectedCourtId && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">2. Pilih Tanggal & Jam</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kalender */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Pilih Tanggal
              </label>
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50 p-2">
                <CustomCalendar value={dateStr} onChange={setDateStr} />
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Slot Jam Tersedia</span>
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px]"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div>Kosong</span>
                  <span className="flex items-center gap-1 text-[10px]"><div className="w-2 h-2 bg-red-400 rounded-full"></div>Terisi</span>
                </span>
              </label>

              {loadingSlots ? (
                <div className="flex items-center justify-center h-48 border border-gray-100 rounded-xl bg-gray-50/50 text-gray-400 text-sm gap-2">
                  <span className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  Memuat ketersediaan...
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getOperationalHours().map((hour) => {
                      const booked = isHourBooked(hour);
                      const isSelected = typeof startTime === "number" && typeof endTime === "number" && hour >= startTime && hour < endTime;
                      const isStart = typeof startTime === "number" && hour === startTime;
                      const isEnd = typeof endTime === "number" && hour === endTime - 1;
                      
                      return (
                        <button
                          key={hour}
                          type="button"
                          disabled={booked}
                          onClick={() => handleSlotClick(hour)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            booked
                              ? "bg-red-50 border-red-100 text-red-400 cursor-not-allowed opacity-60"
                              : isSelected
                              ? "bg-violet-600 border-violet-600 text-white shadow-md transform scale-105 z-10 font-bold"
                              : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50 cursor-pointer font-medium"
                          }`}
                        >
                          <span className="text-sm block">
                            {hour}:00
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {startTime === "" ? (
                    <div className="mt-4 bg-blue-50 text-blue-700 text-xs p-3 rounded-xl flex items-start gap-2 border border-blue-100">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>
                        Pilih jam mulai terlebih dahulu dengan mengklik salah satu slot jam yang tersedia.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 bg-violet-50/50 border border-violet-100 rounded-xl p-4 shadow-sm animate-fade-in-up">
                      <label className="block text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">
                        Pilih Paket Durasi
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: maxDuration }, (_, i) => i + 1).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDuration(d)}
                            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-sm font-bold transition border ${
                              duration === d
                                ? "bg-violet-600 border-violet-600 text-white shadow-md transform scale-105 z-10"
                                : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50"
                            }`}
                          >
                            {d} Jam
                          </button>
                        ))}
                      </div>
                      {maxDuration < 5 && (
                        <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                          <Info size={14} /> 
                          Maksimal {maxDuration} jam karena mendekati jadwal tutup atau sudah dibooking.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 - RINGKASAN SEWA (di bawah, full width) */}
      {selectedCourt && startTime !== "" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">3. Ringkasan & Pembayaran</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kiri: Detail Pesanan */}
            <div className="space-y-5">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Lapangan</p>
                  <p className="font-bold text-gray-800 text-base">{selectedCourt.name}</p>
                  <p className="text-xs text-violet-600 font-bold mt-0.5">Rp {selectedCourt.pricePerHour.toLocaleString()}/Jam</p>
                </div>
              </div>

              <div className="flex gap-4 items-center border-t border-gray-100 pt-5">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex flex-col items-center justify-center text-emerald-600 shrink-0">
                  <span className="text-[9px] font-bold uppercase leading-none">{dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' }) : "-"}</span>
                  <span className="text-xl font-black leading-none">{dateStr ? new Date(dateStr).getDate() : "-"}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Jadwal Main</p>
                  <p className="font-bold text-gray-800 text-base">
                    {`${startTime}:00 - ${endTime}:00`}
                  </p>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">{actualDuration} Jam</p>
                </div>
              </div>

              {/* Info Rekening Transfer */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Transfer Ke Rekening</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BCA</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 tracking-wider">7890 1234 5678</p>
                      <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">BNI</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 tracking-wider">0123 4567 8901</p>
                      <p className="text-xs text-gray-500">a.n. <strong>SM Sport Center</strong></p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <Info size={12} /> Bukti transfer wajib diunggah setelah booking berhasil dibuat.
                </p>
              </div>
            </div>

            {/* Kanan: Rincian Biaya & Tombol Submit */}
            <div className="space-y-5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rincian Biaya</h4>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectedCourt.name} × {actualDuration} Jam</span>
                  <span className="font-bold text-gray-800">Rp {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>PPN (11%)</span>
                  <span className="font-bold text-gray-800">Rp {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-gray-300">
                  <span className="font-bold text-gray-800 text-base">Total Pembayaran</span>
                  <span className="text-2xl font-black text-violet-600">Rp {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleBooking}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-4 rounded-xl transition duration-200 shadow-lg shadow-violet-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-base"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield size={18} /> Buat Pesanan & Lanjut Bayar
                    </>
                  )}
                </button>
              </form>
              <div className="text-center flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <Shield size={12} /> Pembayaran aman terenkripsi
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

