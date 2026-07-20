"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

type LiveCourt = {
  id: string;
  name: string;
  type: string;
  status: string; // "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  currentBooking: {
    userName: string;
    startTime: number;
    endTime: number;
  } | null;
};

interface LiveCourtStatusProps {
  courts: LiveCourt[];
}

export default function LiveCourtStatus({ courts }: LiveCourtStatusProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Status Lapangan
          </h2>
          <p className="text-sm text-gray-400">Jam Operasional Berjalan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courts.map((court) => {
          const isOccupied = court.status === "OCCUPIED";
          const isMaintenance = court.status === "MAINTENANCE";
          const isAvailable = court.status === "AVAILABLE";

          let bgColor = "bg-gray-50 border-gray-200";
          let iconColor = "text-gray-400";
          let labelText = "Tidak Diketahui";
          let labelColor = "text-gray-500";
          let Icon = Clock;

          if (isAvailable) {
            bgColor = "bg-emerald-50 border-emerald-100";
            iconColor = "text-emerald-500";
            labelColor = "text-emerald-700";
            labelText = "KOSONG (Siap dipakai)";
            Icon = CheckCircle2;
          } else if (isOccupied) {
            bgColor = "bg-rose-50 border-rose-100 shadow-sm shadow-rose-100";
            iconColor = "text-rose-500";
            labelColor = "text-rose-700";
            labelText = "SEDANG DIGUNAKAN";
            Icon = XCircle;
          } else if (isMaintenance) {
            bgColor = "bg-amber-50 border-amber-100";
            iconColor = "text-amber-500";
            labelColor = "text-amber-700";
            labelText = "MAINTENANCE";
            Icon = AlertTriangle;
          }

          return (
            <div key={court.id} className={`rounded-xl border p-4 ${bgColor} flex flex-col transition-all duration-200`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800">{court.name}</h3>
                <Icon size={20} className={iconColor} />
              </div>

              <div className="mt-auto">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/50 ${labelColor}`}>
                  {labelText}
                </span>

                {isOccupied && court.currentBooking && (
                  <div className="mt-3 text-sm border-t border-rose-200/50 pt-2 text-rose-800 font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs">
                      {court.currentBooking.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs">{court.currentBooking.userName}</p>
                      <p className="text-[10px] opacity-70">
                        {court.currentBooking.startTime}:00 - {court.currentBooking.endTime}:00
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
