"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";

interface QrisInvoiceQRProps {
  invoiceNumber: string;
  totalPrice: number;
  courtName: string;
  schedule: string;
}

export default function QrisInvoiceQR({
  invoiceNumber,
  totalPrice,
  courtName,
  schedule,
}: QrisInvoiceQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const payload = [
      "SM-SPORT-CENTER",
      invoiceNumber,
      totalPrice.toString(),
      courtName,
      schedule,
    ].join("|");

    QRCode.toDataURL(payload, {
      width: 120,
      margin: 1,
      color: { dark: "#1a1a2e", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl).catch(console.error);
  }, [invoiceNumber, totalPrice, courtName, schedule]);

  if (!qrDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white border border-violet-200 rounded-xl p-2 shadow-sm">
        <img src={qrDataUrl} alt={`QRIS ${invoiceNumber}`} className="w-24 h-24" />
      </div>
      <div className="flex items-center gap-1">
        <QrCode size={10} className="text-violet-600" />
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
          QRIS Dinamis
        </span>
      </div>
    </div>
  );
}
