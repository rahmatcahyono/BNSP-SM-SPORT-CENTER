"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Court {
  id: string;
  name: string;
  type: string;
  openTime: number;
  closeTime: number;
}

interface Reservation {
  id: string;
  courtId: string;
  startTime: number;
  durationHours: number;
  status: string;
  user: {
    name: string;
  };
}

export default function CourtMonitoring({
  courts,
  reservations,
  currentDate,
}: {
  courts: Court[];
  reservations: Reservation[];
  currentDate: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    router.push(`/dashboard/admin/courts?date=${newDate}`);
  };

  // Generate hours array from 08:00 to 23:00
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  const getReservationForSlot = (courtId: string, hour: number) => {
    return reservations.find(
      (res) =>
        res.courtId === courtId &&
        hour >= res.startTime &&
        hour < res.startTime + res.durationHours
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Jadwal Harian</h3>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="date" className="text-sm font-medium text-gray-600">
            Pilih Tanggal:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></div>
          <span className="text-gray-600 font-medium">Tersedia (Kosong)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
          <span className="text-gray-600 font-medium">Sudah Dipesan (Confirmed)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
          <span className="text-gray-600 font-medium">Pending / Menunggu Review</span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* Timeline Header (Hours) */}
          <div className="flex border-b border-gray-200 pb-2">
            <div className="w-48 shrink-0 font-semibold text-gray-500 text-sm pl-2">
              Lapangan
            </div>
            <div className="flex-1 flex">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs font-semibold text-gray-500"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Courts Rows */}
          <div className="pt-2 space-y-3">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center">
                {/* Court Name */}
                <div className="w-48 shrink-0 flex flex-col pr-4">
                  <span className="font-bold text-gray-800 truncate" title={court.name}>
                    {court.name}
                  </span>
                  <span className="text-xs text-gray-500">{court.type}</span>
                </div>

                {/* Hour Slots */}
                <div className="flex-1 flex gap-1">
                  {hours.map((hour) => {
                    const res = getReservationForSlot(court.id, hour);
                    const isOutsideOperatingHours = hour < court.openTime || hour >= court.closeTime;

                    if (isOutsideOperatingHours) {
                      return (
                        <div
                          key={hour}
                          className="flex-1 h-12 bg-gray-100/50 rounded flex items-center justify-center border border-dashed border-gray-200"
                          title="Di luar jam operasional"
                        >
                          <span className="text-[10px] text-gray-400 font-medium">Tutup</span>
                        </div>
                      );
                    }

                    if (res) {
                      const isConfirmed = res.status === "CONFIRMED";
                      const baseColor = isConfirmed
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-amber-50 border-amber-200 text-amber-700";

                      return (
                        <div
                          key={hour}
                          className={`flex-1 h-12 rounded border flex flex-col items-center justify-center p-1 shadow-sm cursor-not-allowed ${baseColor}`}
                          title={`Dipesan oleh ${res.user.name} (${res.status})`}
                        >
                          {isConfirmed ? (
                            <XCircle size={12} className="mb-0.5" strokeWidth={2.5} />
                          ) : (
                            <Clock size={12} className="mb-0.5" strokeWidth={2.5} />
                          )}
                          <span className="text-[9px] font-bold truncate w-full text-center">
                            {res.user.name.split(" ")[0]}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={hour}
                        className="flex-1 h-12 bg-emerald-50/50 border border-emerald-200 rounded flex items-center justify-center hover:bg-emerald-100 transition cursor-pointer shadow-sm"
                        title="Tersedia"
                      >
                        <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={2.5} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {courts.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Belum ada data lapangan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
