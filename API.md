# API & Server Actions Design
## SM Sport Center Reservation System

As we are using Next.js 15 App Router, traditional REST API endpoints (`app/api/...`) are mostly reserved for webhooks (e.g., payment gateways) or external system integrations. For internal application logic, we will utilize **Server Actions**, which provide end-to-end type safety and seamless integration with React forms.

### 1. Server Actions Specification

#### Auth Actions (`actions/auth.ts`)
*   `login(credentials)`: Authenticates user against database, establishes NextAuth session.
*   `register(data: RegisterDTO)`: Hashes password, creates new `Customer` record.
*   `logout()`: Destroys session.

#### Court Actions (`actions/court.ts`) - *Admin Only*
*   `createCourt(data: CourtDTO)`: Adds a new court.
*   `updateCourt(id: string, data: Partial<CourtDTO>)`: Edits court details (e.g., price, status).
*   `deleteCourt(id: string)`: Soft-deletes or disables a court.
*   `getCourts(filters?)`: Retrieves list of courts (can be used by both Admin and Customers).

#### Reservation Actions (`actions/reservation.ts`)
*   `checkAvailability(courtId, date)`: Returns list of occupied hours for a specific court on a specific date.
*   `createReservation(data: ReservationDTO)`: 
    *   **CRITICAL**: Executes `SELECT ... FOR UPDATE` inside a Prisma transaction.
    *   Returns `Reservation` object with `PENDING_PAYMENT` status if successful.
    *   Throws error if slot is already taken.
*   `uploadPaymentProof(reservationId, formData)`: Handles image upload, updates reservation status to `AWAITING_REVIEW`.
*   `approveReservation(reservationId)`: *Admin Only*. Sets status to `CONFIRMED`.
*   `cancelReservation(reservationId)`: Sets status to `CANCELED` (if constraints allow).

#### Reporting Actions (`actions/report.ts`) - *Admin Only*
*   `getDashboardStats(dateRange)`: Aggregates total revenue, total bookings, active users.
*   `exportReservations(format: 'PDF' | 'EXCEL')`: Generates and returns file stream/URL for download.

### 2. External API Routes (REST)
If external integrations are needed in the future, they will be structured as follows:

*   **`GET /api/courts`**: Retrieve available courts (Public).
*   **`POST /api/webhooks/payment`**: (Optional) For automated payment gateway integration (e.g., Midtrans/Stripe).

### 3. Data Transfer Objects (Zod Schemas)
All inputs will be validated using Zod schemas before hitting the database.

```typescript
// Example: Reservation validation
export const ReservationSchema = z.object({
  courtId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.number().min(8).max(22),
  durationHours: z.number().min(1).max(4),
});
```
