"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  X,
  History,
  Activity,
  Users,
  ChevronRight,
  UserCircle,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Review Booking", href: "/dashboard/admin/bookings", icon: FileText },
    { name: "Kelola Lapangan", href: "/dashboard/admin/courts", icon: Activity },
    { name: "Kelola User", href: "/dashboard/admin/users", icon: Users },
    { name: "Laporan", href: "/dashboard/admin/reports", icon: FileText },
  ];

  const customerLinks = [
    { name: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
    { name: "My Bookings", href: "/dashboard/customer/bookings", icon: History },
    { name: "Pesan Lapangan", href: "/dashboard/customer/reservation", icon: CalendarDays },
  ];

  const links = isAdmin ? adminLinks : customerLinks;
  const sectionLabel = isAdmin ? "MENU ADMIN" : "MENU";

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">SM Sport</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div>
          <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">SM Sport</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                {isAdmin ? "Admin Panel" : "Member Portal"}
              </p>
            </div>
          </div>

          {/* Nav Section */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest px-2 mb-2">
              {sectionLabel}
            </p>
            <nav className="space-y-0.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} transition`}>
                        <Icon size={18} />
                      </span>
                      {link.name}
                    </div>
                    {isActive && <ChevronRight size={14} className="text-blue-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile + Logout */}
        <div className="border-t border-gray-100 p-4">
          <Link
            href={isAdmin ? "/dashboard/admin/profile" : "/dashboard/customer/profile"}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-2 py-2.5 rounded-lg mb-1 transition-all duration-150 group ${
              pathname.includes("/profile")
                ? "bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                className="w-9 h-9 rounded-full object-cover shrink-0 shadow-md border-2 border-violet-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-400 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{session?.user?.name || "Member"}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
            <ChevronRight size={14} className={`text-gray-300 group-hover:text-gray-500 transition ${pathname.includes("/profile") ? "text-blue-400" : ""}`} />
          </Link>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition duration-150 cursor-pointer"
          >
            <LogOut size={16} />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
