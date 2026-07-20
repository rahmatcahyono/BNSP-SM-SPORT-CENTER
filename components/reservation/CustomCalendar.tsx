"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CustomCalendar({ value, onChange }: CustomCalendarProps) {
  // Parse initial date value or default to today
  const getInitialDate = () => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Total days in previous month
  const prevTotalDays = new Date(year, month, 0).getDate();

  // Handle month changes
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar cells (always 42 cells to cover 6 rows)
  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = formatDate(prevMonthDate);
    cells.push({ dateStr, dayNum: day, isCurrentMonth: false });
  }

  // 2. Current month days
  for (let i = 1; i <= totalDays; i++) {
    const currentMonthDate = new Date(year, month, i);
    const dateStr = formatDate(currentMonthDate);
    cells.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // 3. Next month leading days
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = formatDate(nextMonthDate);
    cells.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  function formatDate(d: Date): string {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
  }

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-md font-bold text-gray-800">
          {MONTH_NAMES[month]} {year}
        </h4>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          const isSelected = cell.dateStr === value;
          const isToday = formatDate(new Date()) === cell.dateStr;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectDay(cell.dateStr)}
              className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition duration-200 ${
                isSelected
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200 scale-105"
                  : cell.isCurrentMonth
                  ? isToday
                    ? "border border-violet-500 text-violet-600 hover:bg-gray-50"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
