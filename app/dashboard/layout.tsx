import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 print:bg-white print:block">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Panel */}
      <div className="flex flex-col flex-1 min-w-0 print:block">
        {/* Top Header Bar */}
        <div className="print:hidden">
          <DashboardHeader />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
