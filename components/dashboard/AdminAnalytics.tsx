"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type RevenueData = { date: string; revenue: number };
type PeakHoursData = { time: string; bookings: number };

interface AdminAnalyticsProps {
  revenueData: RevenueData[];
  peakHoursData: PeakHoursData[];
}

export default function AdminAnalytics({ revenueData, peakHoursData }: AdminAnalyticsProps) {
  // Custom tooltip for Revenue
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-black text-violet-600">
            Rp {payload[0].value.toLocaleString("id-ID")}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Peak Hours
  const CustomPeakTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-500 mb-1">Pukul {label}</p>
          <p className="text-lg font-black text-orange-500">
            {payload[0].value} <span className="text-sm font-medium text-gray-400">Booking</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">Tren Pendapatan</h2>
          <p className="text-sm text-gray-400">Pemasukan dari booking (7 hari terakhir)</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#94a3b8" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#94a3b8" }} 
                tickFormatter={(value) => `Rp${value / 1000}k`}
              />
              <Tooltip content={<CustomRevenueTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#7c3aed" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#7c3aed" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Hours Heatmap / Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">Jam Sibuk (Peak Hours)</h2>
          <p className="text-sm text-gray-400">Total booking per jam secara keseluruhan</p>
        </div>
        <div className="h-64 w-full">
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8" }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8" }} 
                />
                <Tooltip content={<CustomPeakTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar 
                  dataKey="bookings" 
                  fill="#f97316" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Belum ada data booking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
