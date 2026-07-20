"use client";

import React, { useState, useEffect } from "react";
import { getCourtsAction } from "@/actions/court.actions";
import { createWalkInBookingAction, getReservationsByDateAction } from "@/actions/reservation.actions";
import { getUsersAction } from "@/actions/user.actions";
import { useToast } from "@/components/Providers";
import { X, Calendar as CalIcon, Clock, User, PlusCircle, Check, Search } from "lucide-react";

interface WalkInBookingModalProps {
  onClose: () => void;
}

export default function WalkInBookingModal({ onClose }: WalkInBookingModalProps) {
  const { toast } = useToast();
  const [courts, setCourts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Booking Type Toggle
  const [bookingType, setBookingType] = useState<"NEW" | "EXISTING">("NEW");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState<number | "">("");
  const [duration, setDuration] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");

  const [reservedSlots, setReservedSlots] = useState<{ start: number; duration: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [courtsRes, usersRes] = await Promise.all([
        getCourtsAction(),
        getUsersAction(),
      ]);

      if (courtsRes.success && courtsRes.courts) {
        setCourts(courtsRes.courts.filter((c: any) => c.status === "AVAILABLE"));
      }
      
      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users.filter((u: any) => u.role === "CUSTOMER"));
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!courtId || !date) {
      setReservedSlots([]);
      return;
    }
    async function fetchSlots() {
      const res = await getReservationsByDateAction(courtId, date);
      if (res.success && res.bookings) {
        setReservedSlots(res.bookings.map((b: any) => ({ start: b.startTime, duration: b.durationHours })));
      }
    }
    fetchSlots();
  }, [courtId, date]);

  const selectedCourt = courts.find((c) => c.id === courtId);

  // Calculate max available duration based on existing bookings and close time
  const getMaxDuration = () => {
    if (!selectedCourt || startTime === "") return 1;

    const maxAllowedByClose = selectedCourt.closeTime - startTime;
    let maxAllowedByNextBooking = 5;

    const nextBookings = reservedSlots
      .filter((b) => b.start > startTime)
      .sort((a, b) => a.start - b.start);

    if (nextBookings.length > 0) {
      maxAllowedByNextBooking = nextBookings[0].start - startTime;
    }

    return Math.min(maxAllowedByClose, maxAllowedByNextBooking, 5);
  };

  const isSlotBooked = (hour: number) => {
    return reservedSlots.some((b) => hour >= b.start && hour < b.start + b.duration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !date || startTime === "") {
      return toast("Mohon pilih lapangan, tanggal, dan jam.", "error");
    }

    if (bookingType === "NEW" && !customerName) {
      return toast("Mohon isi nama pelanggan.", "error");
    }

    if (bookingType === "EXISTING" && !selectedUserId) {
      return toast("Mohon pilih pelanggan terdaftar.", "error");
    }

    setSaving(true);
    
    // Find selected user details if EXISTING
    let finalName = customerName;
    let finalEmail = customerEmail || undefined;
    let finalPhone = customerPhone || undefined;
    
    if (bookingType === "EXISTING") {
      const u = users.find(u => u.id === selectedUserId);
      if (u) {
        finalName = u.name;
        finalEmail = u.email;
        finalPhone = u.phoneNumber || undefined;
      }
    }

    const res = await createWalkInBookingAction({
      courtId,
      date,
      startTime: Number(startTime),
      durationHours: duration,
      customerName: finalName,
      customerEmail: finalEmail,
      customerPhone: finalPhone,
      userId: bookingType === "EXISTING" ? selectedUserId : undefined,
      paymentMethod,
    });

    if (res.success) {
      toast(res.message!, "success");
      onClose();
    } else {
      toast(res.error!, "error");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <PlusCircle size={24} className="text-white/80" />
            <div>
              <h2 className="text-lg font-bold">Booking Walk-in</h2>
              <p className="text-xs text-white/70">Input pesanan offline dengan cepat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-10">
              <span className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></span>
            </div>
          ) : (
            <form id="walkin-form" onSubmit={handleSubmit} className="space-y-5">
              
              {/* Booking Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBookingType("NEW")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    bookingType === "NEW" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pelanggan Baru
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType("EXISTING")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    bookingType === "EXISTING" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pelanggan Terdaftar
                </button>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                {bookingType === "NEW" ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <User size={14} /> Nama Pelanggan
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Budi / Walk-In"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          placeholder="budi@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          No. Telepon (Opsional)
                        </label>
                        <input
                          type="tel"
                          placeholder="0812xxxx"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Search size={14} /> Cari Pelanggan
                    </label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    >
                      <option value="" disabled>Pilih Pelanggan Terdaftar...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Court Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Pilih Lapangan
                </label>
                <select
                  required
                  value={courtId}
                  onChange={(e) => {
                    setCourtId(e.target.value);
                    setStartTime("");
                    setDuration(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  <option value="" disabled>Pilih Lapangan</option>
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Rp{Number(c.pricePerHour).toLocaleString("id-ID")}/jam</option>
                  ))}
                </select>
              </div>

              {courtId && (
                <>
                  {/* Date Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CalIcon size={14} /> Tanggal Main
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setStartTime("");
                        setDuration(1);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  {/* Time Slots */}
                  {date && selectedCourt && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock size={14} /> Pilih Jam Mulai
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {Array.from({ length: selectedCourt.closeTime - selectedCourt.openTime }).map((_, i) => {
                          const hour = selectedCourt.openTime + i;
                          const isBooked = isSlotBooked(hour);
                          const isSelected = startTime === hour;
                          
                          return (
                            <button
                              key={hour}
                              type="button"
                              disabled={isBooked}
                              onClick={() => { setStartTime(hour); setDuration(1); }}
                              className={`
                                py-2 rounded-lg text-xs font-bold transition-all border
                                ${isSelected ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200" 
                                  : isBooked ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-violet-400 hover:text-violet-600"}
                              `}
                            >
                              {hour}:00
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Duration Packages */}
                  {startTime !== "" && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Pilih Paket Durasi
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: getMaxDuration() }).map((_, i) => {
                          const hours = i + 1;
                          const isSelected = duration === hours;
                          return (
                            <button
                              key={hours}
                              type="button"
                              onClick={() => setDuration(hours)}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                isSelected
                                  ? "bg-violet-50 border-violet-500 text-violet-700 ring-2 ring-violet-500/20"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-gray-50"
                              }`}
                            >
                              {hours} Jam
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Harga</p>
            <p className="text-xl font-black text-emerald-600">
              Rp {selectedCourt && startTime !== "" ? (Number(selectedCourt.pricePerHour) * duration).toLocaleString("id-ID") : "0"}
            </p>
          </div>
          <button
            type="submit"
            form="walkin-form"
            disabled={saving || !courtId || !date || startTime === ""}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-violet-200 flex items-center gap-2"
          >
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Check size={18} />}
            Simpan Booking
          </button>
        </div>

      </div>
    </div>
  );
}
