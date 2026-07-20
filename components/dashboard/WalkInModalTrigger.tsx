"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import WalkInBookingModal from "./WalkInBookingModal";

export default function WalkInModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-violet-200"
      >
        <Plus size={16} />
        Booking Walk-in / Manual
      </button>

      {isOpen && <WalkInBookingModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
