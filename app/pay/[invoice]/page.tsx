import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaymentClient from "./PaymentClient";

export const metadata = {
  title: "Konfirmasi Pembayaran | SM Sport Center",
};

export default async function PayInvoicePage({
  params,
}: {
  params: { invoice: string };
}) {
  const invoice = params.invoice;

  const reservation = await prisma.reservation.findUnique({
    where: { invoiceNumber: invoice },
    include: { court: true },
  });

  if (!reservation) {
    notFound();
  }

  // Format date and time
  const formattedDate = new Date(reservation.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PaymentClient
        invoiceNumber={reservation.invoiceNumber}
        courtName={reservation.court.name}
        date={formattedDate}
        totalPrice={Number(reservation.totalPrice)}
        status={reservation.status}
      />
    </div>
  );
}
