# ERD dan SQL Script
**Proyek:** Sistem Reservasi Lapangan Olahraga Pada SM Sport Center

## 1. Entity Relationship Diagram (ERD) Deskriptif

Struktur relasi data dalam sistem ini memiliki 3 entitas utama:

- `User` (Pelanggan & Admin)
  - Memiliki banyak `Reservation` (1-to-Many).
- `Court` (Lapangan Futsal/Badminton)
  - Memiliki banyak `Reservation` (1-to-Many).
- `Reservation` (Transaksi Pemesanan)
  - Dimiliki oleh 1 `User` (Many-to-1).
  - Merujuk pada 1 `Court` (Many-to-1).

## 2. SQL Script (Data Definition Language)

Script SQL untuk membangun struktur tabel di PostgreSQL:

```sql
-- Create Enum Types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE "CourtType" AS ENUM ('FUTSAL', 'BADMINTON');
CREATE TYPE "CourtStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_PAYMENT', 'AWAITING_REVIEW', 'CONFIRMED', 'CANCELED');

-- Create User Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Court Table
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CourtType" NOT NULL,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "status" "CourtStatus" NOT NULL DEFAULT 'ACTIVE',
    "openTime" INTEGER NOT NULL DEFAULT 8,
    "closeTime" INTEGER NOT NULL DEFAULT 22,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- Create Reservation Table
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" INTEGER NOT NULL,
    "durationHours" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentProof" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- Create Index and Constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Reservation_invoiceNumber_key" ON "Reservation"("invoiceNumber");

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```
