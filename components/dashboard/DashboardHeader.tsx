"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Search, LayoutDashboard, CalendarDays, Activity, Users, History, X, ArrowRight, FileText } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  role?: "ADMIN" | "CUSTOMER" | "ALL";
  keywords?: string[];
}

const ALL_MENUS: MenuItem[] = [
  // Admin menus
  { name: "Overview", description: "Dashboard utama admin", href: "/dashboard/admin", icon: LayoutDashboard, role: "ADMIN", keywords: ["dashboard", "beranda", "home", "overview"] },
  { name: "Review Booking", description: "Verifikasi pembayaran & jadwal", href: "/dashboard/admin/bookings", icon: FileText, role: "ADMIN", keywords: ["booking", "reservasi", "jadwal", "pembayaran"] },
  { name: "Kelola Lapangan", description: "Tambah/edit data lapangan", href: "/dashboard/admin/courts", icon: Activity, role: "ADMIN", keywords: ["lapangan", "court", "futsal", "kelola"] },
  { name: "Kelola User", description: "Manajemen data pengguna sistem", href: "/dashboard/admin/users", icon: Users, role: "ADMIN", keywords: ["user", "pengguna", "akun", "kelola", "manajemen"] },
  { name: "Laporan", description: "Export & pantau laporan transaksi", href: "/dashboard/admin/reports", icon: FileText, role: "ADMIN", keywords: ["laporan", "report", "csv", "transaksi", "keuangan"] },
  // Customer menus
  { name: "My Bookings", description: "Lihat riwayat pemesanan Anda", href: "/dashboard/customer", icon: History, role: "CUSTOMER", keywords: ["booking", "pemesanan", "riwayat", "history"] },
  { name: "Reservasi Lapangan", description: "Buat reservasi lapangan baru", href: "/reservation", icon: CalendarDays, role: "CUSTOMER", keywords: ["reservasi", "pesan", "lapangan", "baru"] },
];

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const userRole = session?.user?.role as "ADMIN" | "CUSTOMER" | undefined;

  const filteredMenus = ALL_MENUS.filter((menu) => {
    // Filter by role
    if (menu.role && menu.role !== "ALL" && menu.role !== userRole) return false;

    if (!query) return true;

    const q = query.toLowerCase();
    return (
      menu.name.toLowerCase().includes(q) ||
      menu.description.toLowerCase().includes(q) ||
      menu.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const navigate = useCallback((href: string) => {
    closePalette();
    router.push(href);
  }, [closePalette, router]);

  // Global keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? closePalette() : openPalette();
      }
      if (e.key === "Escape") closePalette();
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isOpen, openPalette, closePalette]);

  // Arrow key navigation + Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(filteredMenus.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + Math.max(filteredMenus.length, 1)) % Math.max(filteredMenus.length, 1));
    } else if (e.key === "Enter") {
      if (filteredMenus[selectedIndex]) {
        navigate(filteredMenus[selectedIndex].href);
      }
    }
  };

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <>
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        {/* Search Bar Trigger */}
        <button
          onClick={openPalette}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 w-72 text-sm text-gray-400 transition-all cursor-pointer"
        >
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <span>Cari menu atau perintah...</span>
          <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 rounded px-1.5 py-0.5 font-mono">⌘K</span>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2.5 border-l border-gray-200 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{session?.user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400">{session?.user?.role}</p>
            </div>
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-blue-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm">
                {session?.user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closePalette(); }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari menu atau perintah..."
                className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={16} />
                </button>
              )}
              <kbd className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-mono border border-gray-200">ESC</kbd>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filteredMenus.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Tidak ada hasil untuk &quot;{query}&quot;
                </div>
              ) : (
                filteredMenus.map((menu, idx) => {
                  const Icon = menu.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={menu.href}
                      onClick={() => navigate(menu.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
                        <Icon size={17} className={isSelected ? "text-blue-600" : "text-gray-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{menu.name}</p>
                        <p className="text-xs text-gray-400 truncate">{menu.description}</p>
                      </div>
                      {isSelected && <ArrowRight size={15} className="text-blue-400 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 py-0.5 border border-gray-200">↑↓</kbd> navigasi</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 py-0.5 border border-gray-200">↵</kbd> buka</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 py-0.5 border border-gray-200">ESC</kbd> tutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
