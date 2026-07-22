"use client";

import React, { useState, useEffect } from "react";
import { getAllCourtsAvailabilityAction } from "@/actions/reservation.actions";
import { Calendar, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourtAvailabilityGrid() {
  const router = useRouter();
  
  // Set default date to today in YYYY-MM-DD local time
  const getTodayStr = () => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split("T")[0];
  };

  const [dateStr, setDateStr] = useState(getTodayStr());
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getAllCourtsAvailabilityAction(dateStr);
      if (res.success && res.data) {
        setCourts(res.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [dateStr]);

  const isSlotBooked = (hour: number, bookedSlots: { start: number, end: number }[]) => {
    return bookedSlots.some(slot => hour >= slot.start && hour < slot.end);
  };

  const handleSlotClick = (courtId: string, hour: number, booked: boolean) => {
    // No interaction needed based on user request. 
    // It's just a view-only grid.
  };

  const todayStr = getTodayStr();

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-violet-600" />
            Cek Ketersediaan Lapangan
          </h2>
          <p className="text-xs text-gray-500 mt-1">Pilih tanggal untuk melihat jadwal kosong.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="date"
            min={todayStr}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-violet-500 mb-4" size={32} />
          <p className="text-gray-500 font-medium text-sm">Memuat jadwal lapangan...</p>
        </div>
      ) : courts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
          Tidak ada data lapangan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div key={court.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              
              {/* Court Header (Image + Title) */}
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                {court.imageUrl ? (
                  <img src={court.imageUrl} alt={court.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    {court.type}
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{court.name}</h3>
                  <p className="text-gray-300 text-sm font-medium">
                    Rp {Number(court.pricePerHour).toLocaleString('id-ID')} <span className="text-gray-400 font-normal">/ jam</span>
                  </p>
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-5 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">Pilih Jam Main</p>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: court.closeTime - court.openTime }).map((_, i) => {
                    const hour = court.openTime + i;
                    const booked = isSlotBooked(hour, court.bookedSlots);
                    
                    return (
                      <div
                        key={hour}
                        className={`
                          flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all duration-200
                          ${booked 
                            ? 'bg-rose-50 border-rose-100 opacity-70' 
                            : 'bg-white border-blue-100'}
                        `}
                      >
                        <span className={`text-sm font-bold ${booked ? 'text-rose-400' : 'text-blue-600'}`}>
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                        <span className={`text-[9px] mt-0.5 font-bold tracking-wider ${booked ? 'text-rose-500' : 'text-blue-400'}`}>
                          {booked ? 'PENUH' : 'KOSONG'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
