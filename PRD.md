# Product Requirement Document (PRD)
## SM Sport Center Reservation System

### 1. Introduction & Background
SM Sport Center is a multi-sport facility with:
- **2 Futsal Courts** (Lapangan Futsal 1, Lapangan Futsal 2)
- **3 Badminton Courts** (Lapangan Badminton 1, Lapangan Badminton 2, Lapangan Badminton 3)

Currently, all reservation processes are managed manually via WhatsApp and telephone. This manual system suffers from:
1. **Double Booking**: Overlapping schedules due to tracking errors.
2. **Schedule Conflicts**: Difficulty checking availability in real-time.
3. **Transaction Discrepancies**: Missing or incorrect payment records.
4. **Poor Reporting**: Hard to generate daily/weekly/monthly revenue and booking summaries.
5. **Customer Friction**: Customers cannot check vacant slots themselves.

**Objective**: Build a modern, web-based reservation system to automate court management, reservations, secure transactions, prevent double bookings, and provide real-time dashboard analytics.

---

### 2. User Roles & Actors
The system identifies two primary roles:

| Role | Description |
|---|---|
| **Admin** | Internal manager responsible for court availability, reviewing reservations, approving payments, managing customers, and accessing financial/booking reports. |
| **Customer** | External users who register, check schedule availability, book courts, upload payment proofs, view their booking history, and cancel bookings. |

---

### 3. Use Case Diagram
The following Mermaid diagram maps out the relationship between the Actors and the Use Cases:

```mermaid
left_to_right_direction
actor Admin
actor Customer
actor Guest

rectangle "SM Sport Center Reservation System" {
  usecase "Register & Login" as UC_Auth
  usecase "View Schedule Availability" as UC_Schedule
  usecase "Reserve Court" as UC_Reserve
  usecase "Upload Payment Proof" as UC_Pay
  usecase "Manage Bookings & Profile" as UC_CustHistory
  
  usecase "Manage Courts & Prices" as UC_AdminCourts
  usecase "Manage Customers" as UC_AdminCust
  usecase "Approve/Reject Payments" as UC_AdminPay
  usecase "View Dashboard & Reports" as UC_AdminReport
  usecase "Cancel Reservation" as UC_Cancel
}

Guest --> UC_Auth
Guest --> UC_Schedule

Customer --> UC_Auth
Customer --> UC_Schedule
Customer --> UC_Reserve
Customer --> UC_Pay
Customer --> UC_CustHistory
Customer --> UC_Cancel

Admin --> UC_Auth
Admin --> UC_AdminCourts
Admin --> UC_AdminCust
Admin --> UC_AdminPay
Admin --> UC_AdminReport
Admin --> UC_Cancel
```

---

### 4. Functional Requirements

#### 4.1 Authentication & Authorization
- **Register**: Customers can sign up using name, email, phone number, and a hashed password.
- **Login/Logout**: Secure login using JWT sessions via Auth.js (NextAuth) supporting session timeouts.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `Customer`.
- **Protected Routes**: Next.js middleware checking session and role validation before routing.
- **Forgot Password**: Password reset mechanism using secure reset tokens.

#### 4.2 Court Management (Admin Only)
- **CRUD Operations**: Add, edit, disable, or delete courts.
- **Court Meta**: Name, type (Futsal, Badminton), hourly price, status (Available, Maintenance), operational hours (e.g., 08:00 - 22:00).

#### 4.3 Customer Management (Admin Only)
- **CRUD Operations**: Admin can view, edit, or disable customer accounts.
- **Profile History**: View history of bookings and payments linked to each customer.

#### 4.4 Reservation System
- **Interactive Scheduler**: Date picker, court filter, time-slot selection grid.
- **Real-Time Availability**: Slots are checked on the server before displaying to prevent selecting already booked slots.
- **Invoice Generation**: Create a unique invoice with reservation details, court name, selected hours, total cost, and payment instructions.
- **Double Booking Prevention Flow**:
  - Start database transaction (`BEGIN TRANSACTION`).
  - Read query with row-level lock (`SELECT ... FOR UPDATE`) on overlapping bookings for the specific court, date, and hour.
  - If a record exists, abort and rollback transaction.
  - Insert new reservation with status `PENDING_PAYMENT`.
  - Commit transaction.

#### 4.5 Payment Processing
- **Customer Upload**: Customers upload a payment proof image (receipt).
- **Admin Review**: Admin reviews the payment proof inside the Admin Dashboard.
- **Status Updates**: Payments can be marked as `PENDING`, `APPROVED` (finalizes reservation), or `REJECTED` (releases slot).

#### 4.6 Dashboard & Analytics
- **Admin Dashboard**:
  - Metrics: Today's Bookings, Monthly Revenue, Available Courts, Cancelled Bookings.
  - Popular Court: Visual graph representing booking distributions.
- **Customer Dashboard**:
  - Overview of upcoming active bookings and recent history.

#### 4.7 Reports & Export
- **Filtering**: Daily, weekly, monthly, and yearly filters.
- **Formats**: Export to PDF and Excel (CSV) for accounting audits.

---

### 5. Non-Functional Requirements

- **Responsive Design**: Mobile-first design for both Admin and Customer viewports using TailwindCSS.
- **Performance (Fast)**:
  - SSR (Server-Side Rendering) for static/analytical elements.
  - Optimistic updates on the client UI.
  - Database indexes on `reservations(court_id, date, start_time)`.
- **Security**:
  - CSRF protection via NextAuth session tokens.
  - Password hashing using `bcrypt`.
  - Input validation using Zod on both API routes and Server Actions.
  - SQL Injection prevention via Prisma parameterized queries.
- **Audit Logs & Error Logging**:
  - Logs system activity (e.g. logins, failed payment reviews).
  - Traceable database logs storing modification timestamps.

---

### 6. User Stories

#### Customer Stories
1. **As a customer**, I want to register an account with my phone number and email, so that I can make court reservations.
2. **As a customer**, I want to view available slots in real-time, so that I don't select a court that is already occupied.
3. **As a customer**, I want to reserve a court slot and get an invoice, so that I have a reference for payment.
4. **As a customer**, I want to upload my bank transfer receipt, so that the admin can confirm my booking.
5. **As a customer**, I want to cancel my reservation up to 24 hours in advance, so that I can get a schedule adjustments.

#### Admin Stories
1. **As an admin**, I want to see today's reservations and payment approvals on my dashboard, so that I can quickly review tasks.
2. **As an admin**, I want to add new courts and adjust prices, so that our facility can offer different pricing plans.
3. **As an admin**, I want to review payment uploads and approve or reject bookings, so that we ensure revenue is collected.
4. **As an admin**, I want to export financial reports to Excel, so that I can submit them to the accounting team.

---

### 7. Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Race condition / Overlapping bookings** | High (Double booking leads to customer complaints) | Implement pessimistic row locks (`SELECT ... FOR UPDATE`) in Postgres and atomic transactions in Prisma. |
| **Fake Payment Proofs** | Medium (Financial losses) | Mandate visual review of image uploads by Admin before changing booking state to `CONFIRMED`. |
| **SQL Injection** | High (Data breach) | Utilize Prisma ORM, which uses parameterized queries by default. Validate inputs with Zod. |
| **High Concurrent Load (1000+ Users)** | Medium (Site crashes or slows down) | Implement DB connection pooling (via Neon serverless pooler), caching of static routes, and pagination on lists. |
