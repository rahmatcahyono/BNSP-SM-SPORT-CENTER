"use client";

import React from "react";

export default function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full mt-3 text-sm font-bold text-violet-600 hover:text-violet-700 py-3"
    >
      Cetak / Simpan PDF
    </button>
  );
}
